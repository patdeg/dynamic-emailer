# Makefile for Emailer.js project

include .env
export $(shell sed 's/=.*//' .env)

# Default values for stock symbol and timeframe (unused variables)
SYMBOL ?= UNH

# Default task: Run the application with a sample email configuration
test:
	# Execute the main application script with a sample email configuration
	node app/app.js emails/email1

# Task to copy all project code to the clipboard (excluding test and package files)
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


