SOURCES = lib/**/*.js
TESTS = test/*.test.js

# ==============================================================================
# Node Tests
# ==============================================================================

MOCHA = ./node_modules/.bin/mocha

test: test-node
test-node:
	@NODE_PATH=./lib \
	$(MOCHA) \
		--reporter spec \
		--require test/bootstrap/node $(TESTS)

# ==============================================================================
# Static Analysis
# ==============================================================================

JSHINT = jshint

hint: lint
lint:
	$(JSHINT) $(SOURCES)


.PHONY: test test-node hint lint
