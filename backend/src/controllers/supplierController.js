const { Supplier } = require('../models');
const { Op } = require('sequelize');

const listSuppliers = async (req, res) => {
    try {
        const shop_id = req.user.shop_id;
        const { search = '' } = req.query;
        const suppliers = await Supplier.findAll({
            where: {
                shop_id,
                [Op.or]: [
                    { name: { [Op.iLike]: `%${search}%` } },
                    { contact_person: { [Op.iLike]: `%${search}%` } }
                ]
            },
            order: [['name', 'ASC']]
        });
        res.json(suppliers);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch suppliers' });
    }
};

const createSupplier = async (req, res) => {
    try {
        const shop_id = req.user.shop_id;
        const { name, phone, email, contact_person } = req.body;
        if (!name) return res.status(400).json({ error: 'Name is required' });
        const supplier = await Supplier.create({ shop_id, name, phone, email, contact_person });
        res.status(201).json(supplier);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create supplier' });
    }
};

const updateSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        const shop_id = req.user.shop_id;
        const { name, phone, email, contact_person } = req.body;
        const supplier = await Supplier.findOne({ where: { id, shop_id } });
        if (!supplier) return res.status(404).json({ error: 'Supplier not found' });
        await supplier.update({ name, phone, email, contact_person });
        res.json(supplier);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update supplier' });
    }
};

const deleteSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        const shop_id = req.user.shop_id;
        const supplier = await Supplier.findOne({ where: { id, shop_id } });
        if (!supplier) return res.status(404).json({ error: 'Supplier not found' });
        await supplier.destroy();
        res.json({ message: 'Supplier deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete supplier' });
    }
};

module.exports = { listSuppliers, createSupplier, updateSupplier, deleteSupplier };
