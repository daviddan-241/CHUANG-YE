#!/bin/bash

echo "🧪 Testing DAVE Social AI..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

echo "✅ npm $(npm -v) detected"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "✅ Dependencies installed"

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
npx prisma generate

echo "✅ Prisma client generated"

# Build the application
echo "🔨 Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🚀 To start the application, run:"
    echo "   npm run dev"
    echo ""
    echo "📊 Access the dashboard at:"
    echo "   http://localhost:3000"
else
    echo "❌ Build failed"
    exit 1
fi
