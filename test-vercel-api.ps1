# Comprehensive API Test Script for Vercel Deployment
Write-Host "🧪 Flex Backend API Test Suite" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

$baseUrl = "https://flex-backend-fawn.vercel.app"

# Test 1: Basic connectivity
Write-Host "`n1. Testing basic connectivity..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $baseUrl -Method GET -UseBasicParsing
    Write-Host "✅ Base URL responsive - Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Base URL failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Health endpoint
Write-Host "`n2. Testing /health endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "✅ Health Check: $($health.data.message)" -ForegroundColor Green
    Write-Host "   Timestamp: $($health.data.timestamp)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Health endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: API status endpoint
Write-Host "`n3. Testing /api/v1/status endpoint..." -ForegroundColor Yellow
try {
    $status = Invoke-RestMethod -Uri "$baseUrl/api/v1/status" -Method GET
    Write-Host "✅ API Status: $($status.data.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ API status failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: API Documentation
Write-Host "`n4. Testing /api-docs endpoint..." -ForegroundColor Yellow
try {
    $docs = Invoke-WebRequest -Uri "$baseUrl/api-docs" -Method GET -UseBasicParsing
    Write-Host "✅ API Docs accessible - Status: $($docs.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ API docs failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Authentication
Write-Host "`n5. Testing authentication..." -ForegroundColor Yellow
try {
    $loginData = @{
        email = "admin@gmail.com"
        password = "123456"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $loginData
    $token = $loginResponse.data.token
    Write-Host "✅ Login successful, token received" -ForegroundColor Green
    
    # Test 6: Protected endpoints with token
    Write-Host "`n6. Testing protected endpoints..." -ForegroundColor Yellow
    
    # Hello endpoint
    try {
        $hello = Invoke-RestMethod -Uri "$baseUrl/api/v1/hello?name=TestUser" -Method GET -Headers @{"Authorization"="Bearer $token"}
        Write-Host "✅ Hello endpoint: $($hello.data.message)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Hello endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Channels endpoint
    try {
        $channels = Invoke-RestMethod -Uri "$baseUrl/api/v1/channels" -Method GET -Headers @{"Authorization"="Bearer $token"}
        Write-Host "✅ Channels endpoint: $($channels.data.channels.Count) channels found" -ForegroundColor Green
    } catch {
        Write-Host "❌ Channels endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Properties endpoint
    try {
        $properties = Invoke-RestMethod -Uri "$baseUrl/api/v1/properties" -Method GET -Headers @{"Authorization"="Bearer $token"}
        Write-Host "✅ Properties endpoint: $($properties.data.properties.Count) properties found" -ForegroundColor Green
    } catch {
        Write-Host "❌ Properties endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Authentication failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 Test Complete!" -ForegroundColor Cyan
Write-Host "If all tests fail, check Vercel dashboard for deployment errors." -ForegroundColor Yellow
Write-Host "If some tests pass, the API is working but may have specific endpoint issues." -ForegroundColor Yellow