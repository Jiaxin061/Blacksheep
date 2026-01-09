const PDFDocument = require("pdfkit");
const db = require("../config/database");

/**
 * Generate donation certificate PDF
 */
exports.generateCertificate = async (userID, transactionID) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Fetch donation details
      const [donations] = await db.query(
        `SELECT 
          dt.transactionID,
          dt.donation_amount,
          dt.transaction_date,
          u.name AS userName,
          u.email AS userEmail,
          ap.name AS animalName,
          ap.type AS animalType
        FROM donation_transaction dt
        INNER JOIN user u ON dt.userID = u.userID
        INNER JOIN animal_profile ap ON dt.animalID = ap.animalID
        WHERE dt.transactionID = ? AND dt.userID = ? AND dt.payment_status = 'Success'`,
        [transactionID, userID]
      );

      if (donations.length === 0) {
        reject(new Error("Donation not found or access denied"));
        return;
      }

      const donation = donations[0];

      // Create PDF
      const doc = new PDFDocument({
        size: "LETTER",
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Header
      doc.fontSize(28).font("Helvetica-Bold").text("SAVEPAWS RESCUE", {
        align: "center",
      });
      doc.moveDown(0.5);
      doc.fontSize(20).text("DONATION CERTIFICATE", { align: "center" });
      doc.moveDown(2);

      // Certificate body
      doc.fontSize(14).font("Helvetica").text("This certifies that", {
        align: "center",
      });
      doc.moveDown(1);

      doc.fontSize(22).font("Helvetica-Bold").text(donation.userName, {
        align: "center",
      });
      doc.moveDown(1);

      doc.fontSize(14).font("Helvetica").text("has generously donated", {
        align: "center",
      });
      doc.moveDown(1);

      doc.fontSize(24).font("Helvetica-Bold").text(
        `$${parseFloat(donation.donation_amount).toFixed(2)}`,
        { align: "center" }
      );
      doc.moveDown(1);

      doc.fontSize(14).font("Helvetica").text("to support", {
        align: "center",
      });
      doc.moveDown(1);

      doc.fontSize(20).font("Helvetica-Bold").text(donation.animalName, {
        align: "center",
      });
      doc.fontSize(16).font("Helvetica").text(`(${donation.animalType})`, {
        align: "center",
      });
      doc.moveDown(1.5);

      // Date
      const donationDate = new Date(donation.transaction_date);
      const formattedDate = donationDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      doc.fontSize(14).font("Helvetica").text(`on ${formattedDate}`, {
        align: "center",
      });
      doc.moveDown(2);

      // Transaction ID
      doc.fontSize(12).font("Helvetica").text(
        `Transaction ID: ${donation.transactionID}`,
        { align: "center" }
      );
      doc.moveDown(3);

      // Footer
      doc.fontSize(14).font("Helvetica-Bold").text(
        "Thank you for your support!",
        { align: "center" }
      );
      doc.moveDown(2);

      doc.fontSize(12).font("Helvetica").text("SavePaws Animal Rescue", {
        align: "center",
      });
      doc.fontSize(10).text("Dedicated to saving and caring for animals in need", {
        align: "center",
      });
      doc.moveDown(1);

      const generatedDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      doc.fontSize(10).font("Helvetica-Oblique").text(
        `Certificate generated on ${generatedDate}`,
        { align: "center" }
      );

      // Finalize PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

