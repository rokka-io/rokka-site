#!/usr/bin/env bash
set -e

rm -rf dist/*

npm ci
npm run build
