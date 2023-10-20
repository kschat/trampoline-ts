#!/usr/bin/env bash

# First coverage settings are for the GH action that adds a comment with coverage results.
# The second set of coverage settings are used for the coverage badge GH action.
pnpm exec jest --ci \
  --json --coverage --testLocationInResults --outputFile coverage/gh-coverage-report-action.json \
  --coverageReporters json-summary

