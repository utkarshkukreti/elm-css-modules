#!/usr/bin/env node

const fs = require('fs');

const chokidar = require('chokidar');
const colors = require('colors/safe');
const glob = require('glob');
const modules = require('postcss-modules');
const postcss = require('postcss');
const sass = require('node-sass');

const argv = require('yargs').argv;

const usage = () => {
  console.log('Usage: elm-css-modules src [--watch]');
  process.exit(1);
};

const root = argv._[0] || usage();

const banner = 'Generated by elm-css-modules.';

// Write `data` to `to` only if it doesn't exist or it exists and contains
// /generated by/i in it.
const safeWrite = (to, data) => {
  if (fs.existsSync(to)) {
    if (
      fs
        .readFileSync(to)
        .toString()
        .match(/generated by/i) === null
    ) {
      console.error(
        colors.red(`Error ${to} exists and doesn't have a "Generated by" line.
Please delete ${to} or change the name of the input file.`)
      );
      process.exit(1);
    }
  }
  fs.writeFileSync(to, data);
};

const compile = async from => {
  const extRegex = /\.m\.(css|sass|scss)$/;
  const moduleName = from
    .replace(root, '')
    .replace(extRegex, '')
    .split('/')
    .filter(x => x)
    .join('.');
  const toElm = from.replace(extRegex, '.elm');
  const toCss = from.replace(extRegex, '.css');
  let css;
  switch (from
    .split('.')
    .reverse()
    .shift()) {
    case 'css':
      css = fs.readFileSync(from);
      break;
    case 'sass':
    case 'scss':
      css = sass.renderSync({file: from}).css;
      break;
  }
  return postcss([
    modules({
      generateScopedName: '[hash:base64:8]',
      getJSON: function(_, json, _) {
        if (Object.keys(json).length === 0) {
          return;
        }

        let elm = `module ${moduleName} exposing (..)

-- ${banner}

import Html exposing (Attribute)
import Html.Attributes exposing (class)

`;
        for (const key in json) {
          const value = json[key];
          const elmName = key
            .replace(/-([a-z])/g, ms => ms[1].toUpperCase())
            .replace(/[^a-zA-Z0-9]/g, '');
          elm += `
${elmName} : Attribute msg
${elmName} =
    class ${JSON.stringify(value)}

`;
        }
        safeWrite(toElm, elm.slice(0, -1));
      },
    }),
  ])
    .process(css, {from, to: toCss})
    .then(data => {
      safeWrite(toCss, `/* ${banner} */\n\n${data}`);
      console.log(colors.green(`Compiled ${from} to ${toElm} and ${toCss}.`));
    });
};

const main = async () => {
  for (const from of glob.sync(`${root}/**/*.m.{css,sass,scss}`)) {
    await compile(from);
  }
  if (argv.watch) {
    chokidar
      .watch(`${root}/**/*.m.{css,sass,scss}`, {ignored: /node_modules/})
      .on('change', from => {
        compile(from);
      });
  }
};

main().catch(console.error);
