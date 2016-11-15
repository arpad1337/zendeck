#
# @rpi1337
#	- makefile for dev & staging environment setup
#

BUILDID=$(shell date +%Y%m%d-%H:%M:%S)
AUTHOR=$(shell whoami)
export ROOT_DIR=${PWD}

all: 
	echo 'Usage: build-staging | deploy target=X | link | clean | migrate | create-lambda name=NAME'

migrate:
	echo "Migration start at $(BUILDID)"
	$(eval CONFIG :=$(shell ./node_modules/.bin/gulp prepare-migation-config --silent))
	./node_modules/.bin/sequelize --config $(CONFIG) --migrations-path ./migrations --model ./models db:migrate

deploy:
	echo "TODO"