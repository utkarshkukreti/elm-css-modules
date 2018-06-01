default:
	cd examples && make
	erb README.md.erb > README.md

.PHONY: default
