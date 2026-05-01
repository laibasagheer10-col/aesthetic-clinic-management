// server/controllers/invoiceController.js
const Invoice = require('../models/finance/Invoice');
const Payment = require('../models/finance/Payment');
const PDFDocument = require('pdfkit');

exports.createInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.create(req.body);
    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('patientId')
      .populate('paymentId')
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.generateInvoiceFromPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId)
      .populate('patientId')
      .populate('appointmentId');

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const invoice = await Invoice.create({
      patientId: payment.patientId._id,
      paymentId: payment._id,
      items: [{
        description: `Appointment on ${new Date(payment.appointmentId?.date || Date.now()).toLocaleDateString()}`,
        quantity: 1,
        unitPrice: payment.amount,
        total: payment.amount
      }],
      subtotal: payment.amount,
      total: payment.amount,
      status: 'Paid',
      paidDate: payment.paymentDate || Date.now()
    });

    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.downloadInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('patientId');

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Create PDF
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);

    doc.pipe(res);

    // Add content to PDF
    doc.fontSize(20).text('INVOICE', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Invoice #: ${invoice.invoiceNumber}`);
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`);
    doc.text(`Patient: ${invoice.patientId?.name || 'N/A'}`);
    doc.text(`Phone: ${invoice.patientId?.phone || 'N/A'}`);
    doc.moveDown();

    // Table
    doc.text('Description', 50, doc.y);
    doc.text('Qty', 300, doc.y);
    doc.text('Price', 400, doc.y);
    doc.text('Total', 500, doc.y);
    doc.moveDown();

    invoice.items.forEach(item => {
      doc.text(item.description, 50, doc.y);
      doc.text(item.quantity.toString(), 300, doc.y);
      doc.text(`₨${item.unitPrice}`, 400, doc.y);
      doc.text(`₨${item.total}`, 500, doc.y);
      doc.moveDown();
    });

    doc.moveDown();
    doc.text(`Subtotal: ₨${invoice.subtotal}`, { align: 'right' });
    doc.text(`Total: ₨${invoice.total}`, { align: 'right' });
    doc.text(`Status: ${invoice.status}`, { align: 'right' });

    doc.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};