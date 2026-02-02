const PDFDocument = require('pdfkit');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

// Generate contract PDF
const generateContractPDF = async (contract) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        size: 'A4', 
        margin: 50,
        info: {
          Title: `Contract ${contract.contractNumber}`,
          Author: 'Car Rental System'
        }
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', async () => {
        try {
          const pdfBuffer = Buffer.concat(chunks);
          
          // Upload to Cloudinary
          const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder: 'car-rental/contracts',
                resource_type: 'raw',
                public_id: `contract-${contract.contractNumber}`,
                format: 'pdf'
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
            
            const bufferStream = new Readable();
            bufferStream.push(pdfBuffer);
            bufferStream.push(null);
            bufferStream.pipe(uploadStream);
          });

          resolve({
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id
          });
        } catch (uploadError) {
          reject(uploadError);
        }
      });

      // Header
      doc.fontSize(20).font('Helvetica-Bold').text('CAR RENTAL CONTRACT', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).font('Helvetica').text(`Contract Number: ${contract.contractNumber}`, { align: 'center' });
      doc.fontSize(10).text(`Date: ${new Date().toLocaleDateString()}`, { align: 'center' });
      doc.moveDown(2);

      // Client Information Section
      doc.fontSize(14).font('Helvetica-Bold').text('CLIENT INFORMATION');
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica');
      doc.text(`Name: ${contract.clientInfo.name}`);
      doc.text(`Email: ${contract.clientInfo.email}`);
      doc.text(`Phone: ${contract.clientInfo.phone}`);
      doc.text(`CIN: ${contract.clientInfo.CIN}`);
      doc.text(`Driving License: ${contract.clientInfo.drivingLicense}`);
      if (contract.clientInfo.address) {
        doc.text(`Address: ${contract.clientInfo.address}`);
      }
      doc.moveDown();

      // Vehicle Information Section
      doc.fontSize(14).font('Helvetica-Bold').text('VEHICLE INFORMATION');
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica');
      doc.text(`Vehicle: ${contract.carInfo.brand} ${contract.carInfo.model} (${contract.carInfo.year})`);
      doc.text(`License Plate: ${contract.carInfo.licensePlate}`);
      doc.text(`Color: ${contract.carInfo.color}`);
      doc.text(`Mileage at Pickup: ${contract.carInfo.mileage} km`);
      doc.moveDown();

      // Rental Details Section
      doc.fontSize(14).font('Helvetica-Bold').text('RENTAL DETAILS');
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica');
      doc.text(`Pickup Date: ${new Date(contract.rentalInfo.pickupDate).toLocaleDateString()}`);
      doc.text(`Return Date: ${new Date(contract.rentalInfo.returnDate).toLocaleDateString()}`);
      doc.text(`Pickup Location: ${contract.rentalInfo.pickupLocation || 'Office'}`);
      doc.text(`Return Location: ${contract.rentalInfo.returnLocation || 'Office'}`);
      doc.text(`Total Days: ${contract.rentalInfo.totalDays}`);
      doc.text(`Daily Rate: ${contract.rentalInfo.dailyRate} DH`);
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text(`Total Price: ${contract.rentalInfo.totalPrice} DH`);
      doc.moveDown();

      // Terms and Conditions
      doc.fontSize(14).font('Helvetica-Bold').text('TERMS AND CONDITIONS');
      doc.moveDown(0.5);
      doc.fontSize(9).font('Helvetica');
      doc.text(contract.terms, { align: 'justify' });
      doc.moveDown(2);

      // Signature Section
      doc.fontSize(12).font('Helvetica-Bold').text('SIGNATURES', { align: 'center' });
      doc.moveDown();
      
      const pageWidth = doc.page.width - 100;
      const colWidth = pageWidth / 2;
      
      doc.fontSize(10).font('Helvetica');
      doc.text('Client Signature:', 50);
      doc.text('Company Representative:', 50 + colWidth);
      doc.moveDown(3);
      doc.text('________________________', 50);
      doc.text('________________________', 50 + colWidth);
      doc.moveDown(0.5);
      doc.text(contract.clientInfo.name, 50);
      doc.text('Car Rental', 50 + colWidth);

      // Footer
      doc.moveDown(2);
      doc.fontSize(8).text('This contract is legally binding once signed by both parties.', { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generateContractPDF
};
