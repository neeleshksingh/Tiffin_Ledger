const pdf = require('html-pdf');
const User = require('../models/user');
const TiffinTracking = require('../models/tiffin-tracking');

const generateBillPDF = async (req, res) => {
    const { userId, date } = req.body;

    if (!userId || !date) {
        return res.status(400).json({ message: "Invalid request data" });
    }

    try {
        const user = await User.findById(userId);
        const tiffinTracking = await TiffinTracking.findOne({ userId });

        if (!user || !tiffinTracking) {
            return res.status(404).json({ message: "User or Tiffin tracking data not found" });
        }

        const uniqueCode = user._id.toString().slice(-4).toUpperCase();
        const invoiceNumber = `INV${uniqueCode}${Date.now()}`;

        const billingInfo = {
            name: user.name,
            gstin: user.gstin,
            address: user.address,
        };

        const datesTaken = [];
        tiffinTracking.days.forEach((value, key) => {
            if (value === true) {
                datesTaken.push(key);
            }
        });

        if (datesTaken.length === 0) {
            return res.status(404).json({ message: "No tiffin days found for this user." });
        }

        const sortedDates = datesTaken
            .map(date => {
                const [day, month, year] = date.split('/');
                const formattedDay = day.padStart(2, '0');
                return `${formattedDay}`;
            })
            .sort((a, b) => a - b);

        const items = sortedDates.map((dateTaken) => {
            const price = 50;
            const amount = price * 1;
            return {
                name: `Tiffin on ${dateTaken}`,
                quantity: 1,
                price,
                amount,
            };
        });

        const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
        const gstAmount = (totalAmount * 18) / 100;
        const grandTotal = totalAmount + gstAmount;

        const htmlContent = `
          <html>
            <head>
              <style>
                body {
                  font-family: 'Arial', sans-serif;
                  margin: 0;
                  padding: 0;
                  color: #333;
                  background-color: #f4f4f4;
                }
                .container {
                  width: 80%;
                  margin: auto;
                  background-color: white;
                  padding: 20px;
                  border-radius: 8px;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                .invoice-header {
                  text-align: center;
                  margin-bottom: 30px;
                }
                .invoice-header h2 {
                  margin: 0;
                  color: #007bff;
                }
                .invoice-header p {
                  margin: 5px 0;
                  font-size: 14px;
                  color: #555;
                }
                .invoice-table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-bottom: 30px;
                }
                .invoice-table th, .invoice-table td {
                  padding: 8px;
                  text-align: left;
                  border: 1px solid #ddd;
                }
                .invoice-table th {
                  background-color: #f2f2f2;
                  color: #555;
                }
                .invoice-table td {
                  font-size: 14px;
                  color: #333;
                }
                .table {
                  width: 100%;
                  margin-top: 20px;
                  border-collapse: collapse;
                  border: 1px solid #ddd;
                }
                .table th, .table td {
                  padding: 8px;
                  text-align: left;
                  border: 1px solid #ddd;
                }
                .table th {
                  background-color: #f2f2f2;
                  color: #555;
                }
                .table td {
                  font-size: 14px;
                  color: #333;
                }
                .table tfoot td {
                  font-weight: bold;
                  background-color: #f2f2f2;
                }
                .total {
                  margin-top: 20px;
                  display: flex;
                  justify-content: space-between;
                  font-size: 16px;
                  padding-top: 10px;
                }
                .footer {
                  text-align: center;
                  font-size: 12px;
                  color: #777;
                  margin-top: 40px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="invoice-header">
                  <h2>Invoice</h2>
                  <p>Invoice Number: ${invoiceNumber}</p>
                  <p>Date: ${date}</p>
                </div>
                
                <table class="invoice-table">
                  <tbody>
                    <tr>
                      <td>Name</td>
                      <td>${billingInfo.name}</td>
                    </tr>
                    <tr>
                      <td>GSTIN</td>
                      <td>${billingInfo.gstin}</td>
                    </tr>
                    <tr>
                      <td>Address</td>
                      <td>${billingInfo.address}</td>
                    </tr>
                  </tbody>
                </table>
                
                <table class="table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${items.map(item => `
                      <tr>
                        <td>${item.name}</td>
                        <td>${item.quantity}</td>
                        <td>${item.price}</td>
                        <td>${item.amount}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="3" style="text-align: right;">Total Amount:</td>
                      <td>${totalAmount}</td>
                    </tr>
                    <tr>
                      <td colspan="3" style="text-align: right;">GST (18%):</td>
                      <td>${gstAmount}</td>
                    </tr>
                    <tr>
                      <td colspan="3" style="text-align: right;">Grand Total:</td>
                      <td>${grandTotal}</td>
                    </tr>
                  </tfoot>
                </table>
                
                <div class="footer">
                  <p>Thank you for your business!</p>
                </div>
              </div>
            </body>
          </html>
        `;


        // Generate PDF from the HTML content
        pdf.create(htmlContent).toBuffer((err, buffer) => {
            if (err) {
                return res.status(500).json({ message: "Error generating PDF" });
            }

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="bill.pdf"');
            res.send(buffer);
        });

    } catch (error) {
        console.error('Server Error:', error);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = { generateBillPDF };