# Makefile for Emailer.js project

include .env
export $(shell sed 's/=.*//' .env)

# Default values for stock symbol and timeframe (unused variables)
SYMBOL ?= UNH

# Default task: Run the application with a sample email configuration
test:
	# Execute the main application script with a sample email configuration
	node app/app.js emails/email2

# Task to copy all project code to the clipboard (excluding test and package files)
showcode:
	@{ \
		for f in `git ls-files | grep -v test | grep -v package-lock ` ; do \
			echo "// $$f"; \
			cat "$$f"; \
			echo; \
			echo "----------------------------------------------"; \
			echo; \
		done; \
	} | wl-copy
	@echo "All code copied to clipboard"

update:
	# Check outdated packages
	@echo "Checking outdated packages..."
	@npm outdated || echo "All packages are up to date."

	# Update all minor/patch versions of packages
	@echo "Updating all packages to minor/patch versions..."
	npm update

	# Use npm-check-updates to upgrade major versions
	@echo "Updating major versions using npm-check-updates..."
	npx npm-check-updates

	# Apply updates and write new versions to package.json
	@echo "Applying updates to package.json..."
	npx npm-check-updates -u

	# Install updated packages
	@echo "Installing updated packages..."
	npm install

	# Confirm the updates
	@echo "The following packages have been updated:"
	npm ls --depth=0


