
include .env
export $(shell sed 's/=.*//' .env)

# Default values for stock symbol and timeframe
SYMBOL ?= UNH

# By default render the stock_price.star file and deploy to all devices
test:
	node app/app.js emails/email1

# Show code of all files in the project
showcode:
	@{ \
		for f in `git ls-files | grep -v test | grep -v package` ; do \
			echo "// $$f"; \
			cat "$$f"; \
			echo; \
			echo "----------------------------------------------"; \
			echo; \
		done; \
	} | wl-copy
	@echo "All code copied to clipboard"
