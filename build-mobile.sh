#!/bin/bash
set -e

echo "▶ إخفاء API routes مؤقتاً..."
mv src/app/api src/app/_api_backup

echo "▶ بناء النسخة الجوال..."
BUILD_TARGET=mobile npm run build

echo "▶ إرجاع API routes..."
mv src/app/_api_backup src/app/api

echo "✅ تم البناء!"
