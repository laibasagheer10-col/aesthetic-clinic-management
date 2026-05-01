const Inventory = require('../models/inventory/Inventory');

// Create inventory item - CORRECTED to match schema
exports.createItem = async (req, res) => {
  try {
    console.log('📦 Creating inventory item:', req.body);
    
    // Your schema uses productName (not name)
    if (!req.body.productName) {
      return res.status(400).json({ error: "Product name is required" });
    }

    // Only include fields that exist in your schema
    const itemData = {
      productName: req.body.productName,
      category: req.body.category || '',
      supplierId: req.body.supplierId || null,
      stockQuantity: parseInt(req.body.stockQuantity) || parseInt(req.body.quantity) || 0,
      purchasePrice: parseFloat(req.body.purchasePrice) || 0,
      sellingPrice: parseFloat(req.body.sellingPrice) || parseFloat(req.body.price) || 0,
      lowStockAlert: parseInt(req.body.lowStockAlert) || 10,
      expiryDate: req.body.expiryDate || null
    };

    const item = await Inventory.create(itemData);
    
    // Populate supplier info if exists
    if (item.supplierId) {
      await item.populate('supplierId');
    }
    
    console.log('✅ Item created:', item);
    res.status(201).json(item);

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all inventory items
exports.getAllItems = async (req, res) => {
  try {
    const items = await Inventory.find()
      .populate('supplierId')
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update inventory item
exports.updateItem = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('supplierId');
    
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    
    res.json(item);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get inventory stats
exports.getInventoryStats = async (req, res) => {
  try {
    const items = await Inventory.find();
    
    const totalItems = items.length;
    const totalStock = items.reduce((sum, item) => sum + (item.stockQuantity || 0), 0);
    const totalValue = items.reduce((sum, item) => sum + ((item.sellingPrice || 0) * (item.stockQuantity || 0)), 0);
    const lowStockItems = items.filter(item => (item.stockQuantity || 0) < (item.lowStockAlert || 10)).length;
    
    res.json({
      totalItems,
      totalStock,
      totalValue,
      lowStockItems,
      expiredItems: 0
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
};