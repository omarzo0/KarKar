# Admin Product APIs

**Base URL:** `/api/admin/products`  
**Authentication:** Bearer Token (Admin)  
**Required Permission:** `canManageProducts` (or `canManageInventory` for inventory routes)

---

## 📋 Example Headers

```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

---

## 1️⃣ Get All Products

```
GET /api/admin/products
```

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |
| `search` | string | - | Search name, description, SKU, brand, tags |
| `category` | string | - | Filter by category |
| `status` | string | - | `active`, `inactive`, `draft` |
| `featured` | boolean | - | `true` or `false` |
| `productType` | string | - | `single` or `package` |
| `minPrice` | number | - | Minimum price |
| `maxPrice` | number | - | Maximum price |
| `minStock` | number | - | Minimum stock quantity |
| `maxStock` | number | - | Maximum stock quantity |
| `sortBy` | string | createdAt | Sort field |
| `sortOrder` | string | desc | `asc` or `desc` |
| `dateFrom` | date | - | Created after date |
| `dateTo` | date | - | Created before date |

### Response

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "_id": "64abc123...",
        "name": "Dental Mirror",
        "description": "High-quality dental mirror",
        "sku": "DM-001",
        "category": "Instruments",
        "subcategory": "Mirrors",
        "price": 25.99,
        "comparePrice": 35.99,
        "cost": 10.00,
        "inventory": {
          "quantity": 100,
          "lowStockAlert": 10,
          "trackInventory": true
        },
        "images": [
          {
            "url": "https://example.com/image.jpg",
            "alt": "Dental Mirror",
            "isPrimary": true
          }
        ],
        "status": "active",
        "featured": false,
        "productType": "single",
        "sales": {
          "totalSold": 50,
          "totalRevenue": 1299.50
        },
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-01-15T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalProducts": 100,
      "hasNext": true,
      "hasPrev": false
    },
    "statistics": {
      "totalProducts": 100,
      "activeProducts": 80,
      "outOfStockProducts": 5,
      "lowStockProducts": 10,
      "totalValue": 50000,
      "averagePrice": 500
    },
    "categories": [
      {
        "_id": "Instruments",
        "count": 30,
        "totalValue": 15000
      },
      {
        "_id": "Equipment",
        "count": 20,
        "totalValue": 25000
      }
    ]
  }
}
```

---

## 2️⃣ Get Product by ID

```
GET /api/admin/products/:productId
```

### Response

```json
{
  "success": true,
  "data": {
    "product": {
      "_id": "64abc123...",
      "name": "Dental Mirror",
      "description": "High-quality dental mirror",
      "sku": "DM-001",
      "category": "Instruments",
      "subcategory": "Mirrors",
      "price": 25.99,
      "comparePrice": 35.99,
      "cost": 10.00,
      "inventory": {
        "quantity": 100,
        "lowStockAlert": 10,
        "trackInventory": true
      },
      "images": [...],
      "specifications": {
        "brand": "DentalPro",
        "material": "Stainless Steel",
        "weight": "50g"
      },
      "seo": {
        "metaTitle": "Dental Mirror - DentalPro",
        "metaDescription": "High-quality dental mirror",
        "slug": "dental-mirror-dm-001"
      },
      "tags": ["mirror", "instrument", "dental"],
      "status": "active",
      "featured": false,
      "productType": "single"
    },
    "analytics": {
      "sales": {
        "totalSold": 50,
        "totalRevenue": 1299.50,
        "averageSalePrice": 25.99,
        "ordersCount": 45
      },
      "monthlyTrend": [
        {
          "_id": { "year": 2025, "month": 1 },
          "quantitySold": 20,
          "revenue": 519.80
        }
      ],
      "inventory": {
        "stockValue": 2599.00,
        "stockOutRisk": false,
        "turnoverRate": 50.0
      },
      "performance": {
        "conversionRate": 2.5,
        "revenuePerUnit": 25.99
      }
    },
    "recentOrders": [
      {
        "_id": "64order123...",
        "orderNumber": "ORD-2025-001",
        "status": "delivered",
        "totals": { "total": 51.98 },
        "createdAt": "2025-01-15T00:00:00.000Z",
        "userId": {
          "username": "johndoe",
          "email": "john@example.com"
        }
      }
    ],
    "recommendations": [...]
  }
}
```

---

## 3️⃣ Create Product

```
POST /api/admin/products
```

### Body (Single Product)

```json
{
  "name": "Dental Mirror",
  "description": "High-quality dental mirror for professional use",
  "sku": "DM-001",
  "category": "Instruments",
  "subcategory": "Mirrors",
  "price": 25.99,
  "comparePrice": 35.99,
  "cost": 10.00,
  "inventory": {
    "quantity": 100,
    "lowStockAlert": 10,
    "trackInventory": true
  },
  "images": [
    {
      "url": "https://example.com/image.jpg",
      "alt": "Dental Mirror",
      "isPrimary": true
    }
  ],
  "specifications": {
    "brand": "DentalPro",
    "material": "Stainless Steel",
    "weight": "50g",
    "dimensions": "15cm x 3cm"
  },
  "seo": {
    "metaTitle": "Dental Mirror - DentalPro",
    "metaDescription": "High-quality dental mirror for professional use",
    "slug": "dental-mirror-dm-001"
  },
  "tags": ["mirror", "instrument", "dental", "professional"],
  "status": "active",
  "featured": false,
  "productType": "single",
  "discount": {
    "type": "percentage",
    "value": 10,
    "startDate": "2025-01-01",
    "endDate": "2025-01-31"
  }
}
```

### Body (Package Product)

```json
{
  "name": "Dental Starter Kit",
  "description": "Complete dental starter kit for new practitioners",
  "sku": "DSK-001",
  "category": "Kits",
  "subcategory": "Starter Kits",
  "price": 199.99,
  "comparePrice": 250.00,
  "productType": "package",
  "packageItems": [
    {
      "productId": "64abc123...",
      "quantity": 2
    },
    {
      "productId": "64abc456...",
      "quantity": 1
    },
    {
      "productId": "64abc789...",
      "quantity": 5
    }
  ],
  "inventory": {
    "quantity": 50,
    "lowStockAlert": 5,
    "trackInventory": true
  },
  "images": [
    {
      "url": "https://example.com/kit-image.jpg",
      "alt": "Dental Starter Kit",
      "isPrimary": true
    }
  ],
  "status": "active",
  "featured": true
}
```

### Response

```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "product": {
      "_id": "64newproduct...",
      "name": "Dental Mirror",
      "sku": "DM-001",
      ...
    }
  }
}
```

---

## 4️⃣ Update Product

```
PUT /api/admin/products/:productId
```

### Body (Partial Update Allowed)

```json
{
  "name": "Updated Dental Mirror",
  "price": 29.99,
  "status": "active",
  "featured": true,
  "images": [
    "https://example.com/image1.jpg"
  ],
  "discount": null,
  "inventory": {
    "quantity": 150,
    "lowStockAlert": 15
  }
}
```

> **Note:**
> - `images` must be an array of image URLs (strings), not objects.
> - To remove discount, set `discount` to `null` or omit it. Allowed values for `discount.type` are only `"percentage"` or `"fixed"`.

### Response

```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "product": {
      "_id": "64abc123...",
      "name": "Updated Dental Mirror",
      "price": 29.99,
      ...
    }
  }
}
```

---

## 5️⃣ Delete Product

```
DELETE /api/admin/products/:productId
```

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `permanent` | boolean | false | `true` for permanent delete, `false` for soft delete (set status to inactive) |

### Example

```
DELETE /api/admin/products/64abc123?permanent=false
```

### Response

```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

## 6️⃣ Update Inventory

```
PUT /api/admin/products/:productId/inventory
```

**Permission Required:** `canManageInventory`

### Body

```json
{
  "quantity": 150,
  "lowStockAlert": 20,
  "operation": "set"
}
```

### Operation Types

| Operation | Description |
|-----------|-------------|
| `set` | Set inventory to exact value |
| `add` | Add to current inventory |
| `subtract` | Subtract from current inventory |

### Examples

**Set inventory to 150:**
```json
{
  "quantity": 150,
  "operation": "set"
}
```

**Add 50 to inventory:**
```json
{
  "quantity": 50,
  "operation": "add"
}
```

**Subtract 10 from inventory:**
```json
{
  "quantity": 10,
  "operation": "subtract"
}
```

### Response

```json
{
  "success": true,
  "message": "Inventory updated successfully",
  "data": {
    "product": {
      "_id": "64abc123...",
      "name": "Dental Mirror",
      "inventory": {
        "quantity": 150,
        "lowStockAlert": 20,
        "trackInventory": true
      }
    }
  }
}
```

---

## 7️⃣ Bulk Operations

```
POST /api/admin/products/bulk
```

### Operation Types

| Operation | Description | Required Data |
|-----------|-------------|---------------|
| `updateStatus` | Update status for multiple products | `status` |
| `updatePrice` | Update price for multiple products | `price` or `priceAdjustment` |
| `delete` | Delete multiple products | `permanent` (optional) |
| `updateCategory` | Update category for multiple products | `category` |

### Examples

**Bulk Update Status:**
```json
{
  "operation": "updateStatus",
  "productIds": ["64abc123...", "64abc456...", "64abc789..."],
  "data": {
    "status": "active"
  }
}
```

**Bulk Update Price (set exact price):**
```json
{
  "operation": "updatePrice",
  "productIds": ["64abc123...", "64abc456..."],
  "data": {
    "price": 29.99
  }
}
```

**Bulk Update Price (percentage adjustment):**
```json
{
  "operation": "updatePrice",
  "productIds": ["64abc123...", "64abc456..."],
  "data": {
    "priceAdjustment": {
      "type": "percentage",
      "value": 10,
      "direction": "increase"
    }
  }
}
```

**Bulk Delete (soft):**
```json
{
  "operation": "delete",
  "productIds": ["64abc123...", "64abc456..."],
  "data": {
    "permanent": false
  }
}
```

**Bulk Update Category:**
```json
{
  "operation": "updateCategory",
  "productIds": ["64abc123...", "64abc456..."],
  "data": {
    "category": "Equipment",
    "subcategory": "Handpieces"
  }
}
```

### Response

```json
{
  "success": true,
  "message": "Bulk operation completed successfully",
  "data": {
    "affected": 3,
    "results": [
      { "productId": "64abc123...", "success": true },
      { "productId": "64abc456...", "success": true },
      { "productId": "64abc789...", "success": true }
    ]
  }
}
```

---

## 8️⃣ Get Low Stock Alerts

```
GET /api/admin/products/alerts/low-stock
```

**Permission Required:** `canManageInventory`

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `threshold` | number | - | Custom stock threshold (overrides product's lowStockAlert) |
| `category` | string | - | Filter by category |
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |

### Example

```
GET /api/admin/products/alerts/low-stock?threshold=15&category=Instruments
```

### Response

```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "_id": "64abc123...",
        "name": "Dental Mirror",
        "sku": "DM-001",
        "category": "Instruments",
        "inventory": {
          "quantity": 8,
          "lowStockAlert": 10
        },
        "price": 25.99,
        "status": "active"
      },
      {
        "_id": "64abc456...",
        "name": "Dental Probe",
        "sku": "DP-001",
        "category": "Instruments",
        "inventory": {
          "quantity": 5,
          "lowStockAlert": 10
        },
        "price": 15.99,
        "status": "active"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalAlerts": 2,
      "hasNext": false,
      "hasPrev": false
    },
    "summary": {
      "totalLowStockProducts": 2,
      "totalOutOfStock": 0,
      "criticalItems": 1
    }
  }
}
```

---

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Name is required"
    }
  ]
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Product not found"
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### Forbidden (403)
```json
{
  "success": false,
  "message": "You don't have permission to perform this action"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Server error while fetching products",
  "error": "Error details..."
}
```

---

## Product Status Values

| Status | Description |
|--------|-------------|
| `active` | Product is visible and available for purchase |
| `inactive` | Product is hidden from customers |
| `draft` | Product is being prepared, not yet published |

## Product Types

| Type | Description |
|------|-------------|
| `single` | Individual product |
| `package` | Bundle of multiple products |
