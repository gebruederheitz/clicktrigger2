dev:
	. $$NVM_DIR/nvm.sh && nvm use && \
	npm i && npm run watch

build:
	. $$NVM_DIR/nvm.sh && nvm use && \
	npm i && npm run build

lint:
	. $$NVM_DIR/nvm.sh && nvm use && \
	npm i && npm run lint

test: lint

release:
	. $$NVM_DIR/nvm.sh && nvm use && \
	npm run release
