#!/bin/sh
# Biên dịch src/app.jsx -> app.js (chạy khi sửa giao diện; cần Node.js + esbuild)
npx esbuild src/app.jsx --minify --target=es2019 --outfile=app.js
