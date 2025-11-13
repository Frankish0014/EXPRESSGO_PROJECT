import nodemailer from 'nodemailer';
import { config } from '../config/app';

export interface BookingEmailData {
  passengerName: string;
  passengerEmail: string;
  bookingCode: string;
  travelDate: string;
  departureCity: string;
  arrivalCity: string;
  departureTime: string;
  arrivalTime: string;
  busCompany: string;
  plateNumber: string;
  seatNumber: number;
  price: number;
  distance?: number;
  duration?: number;
}

export interface BookingCancellationEmailData {
  passengerName: string;
  passengerEmail: string;
  bookingCode: string;
  travelDate: string;
  departureCity: string;
  arrivalCity: string;
  refundAmount?: number;
}

export interface BookingReminderEmailData {
  passengerName: string;
  passengerEmail: string;
  bookingCode: string;
  travelDate: string;
  departureCity: string;
  arrivalCity: string;
  departureTime: string;
  busCompany: string;
  plateNumber: string;
  seatNumber: number;
  hoursUntilDeparture: number;
}

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;

  /**
   * Initialize email transporter
   */
  private static async getTransporter(): Promise<nodemailer.Transporter> {
    if (this.transporter) {
      return this.transporter;
    }

    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: false,
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
    });

    // Verify connection
    try {
      await this.transporter.verify();
      console.log('✅ Email service configured successfully');
    } catch (error) {
      console.error('❌ Email service configuration failed:', error);
      throw new Error('Email service configuration failed');
    }

    return this.transporter;
  }

  /**
   * Send booking confirmation email
   */
  static async sendBookingConfirmation(data: BookingEmailData): Promise<boolean> {
    try {
      const transporter = await this.getTransporter();

      const htmlContent = this.generateBookingConfirmationHTML(data);
      const textContent = this.generateBookingConfirmationText(data);

      const mailOptions = {
        from: config.email.from,
        to: data.passengerEmail,
        subject: `Booking Confirmed - ${data.bookingCode} | ${config.app.name}`,
        text: textContent,
        html: htmlContent,
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('✅ Booking confirmation email sent:', result.messageId);
      return true;
    } catch (error: any) {
      console.error('❌ Failed to send booking confirmation email:', error);
      throw new Error(`Failed to send booking confirmation email: ${error.message}`);
    }
  }

  /**
   * Send booking cancellation email
   */
  static async sendBookingCancellation(data: BookingCancellationEmailData): Promise<boolean> {
    try {
      const transporter = await this.getTransporter();

      const htmlContent = this.generateBookingCancellationHTML(data);
      const textContent = this.generateBookingCancellationText(data);

      const mailOptions = {
        from: config.email.from,
        to: data.passengerEmail,
        subject: `Booking Cancelled - ${data.bookingCode} | ${config.app.name}`,
        text: textContent,
        html: htmlContent,
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('✅ Booking cancellation email sent:', result.messageId);
      return true;
    } catch (error: any) {
      console.error('❌ Failed to send booking cancellation email:', error);
      throw new Error(`Failed to send booking cancellation email: ${error.message}`);
    }
  }

  /**
   * Send booking reminder email
   */
  static async sendBookingReminder(data: BookingReminderEmailData): Promise<boolean> {
    try {
      const transporter = await this.getTransporter();

      const htmlContent = this.generateBookingReminderHTML(data);
      const textContent = this.generateBookingReminderText(data);

      const mailOptions = {
        from: config.email.from,
        to: data.passengerEmail,
        subject: `Travel Reminder - Your trip is in ${data.hoursUntilDeparture} hours!`,
        text: textContent,
        html: htmlContent,
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('✅ Booking reminder email sent:', result.messageId);
      return true;
    } catch (error: any) {
      console.error('❌ Failed to send booking reminder email:', error);
      throw new Error(`Failed to send booking reminder email: ${error.message}`);
    }
  }

  /**
   * Generate HTML content for booking confirmation email (MedConnect Theme)
   */
  private static generateBookingConfirmationHTML(data: BookingEmailData): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
        <div style="background-color: #2c3e50; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;"> ${config.app.name}</h1>
          <p style="margin: 5px 0 0 0;">Digital Bus Booking System</p>
        </div>
        
        <div style="padding: 20px; background-color: white;">
          <h2 style="color: #2c3e50;">Hello ${data.passengerName},</h2>
          <p style="color: #000000;">Your booking has been confirmed and is ready for your journey!</p>
          
          <div style="background-color: #ecf0f1; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #2c3e50;">Booking Details</h3>
            <p style="color: #000000;"><strong>Booking Code:</strong> ${data.bookingCode}</p>
            <p style="color: #000000;"><strong>Company:</strong> ${data.busCompany}</p>
            <p style="color: #000000;"><strong>Plate Number:</strong> ${data.plateNumber}</p>
            <p style="color: #000000;"><strong>Travel Date:</strong> ${new Date(data.travelDate).toLocaleDateString()}</p>
          </div>

          <h3 style="color: #2c3e50;">Journey Details</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
            <thead>
              <tr style="background-color: #34495e; color: white;">
                <th style="padding: 10px; text-align: left;">Route</th>
                <th style="padding: 10px; text-align: left;">Departure</th>
                <th style="padding: 10px; text-align: left;">Arrival</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee; color: #000000;">${data.departureCity} → ${data.arrivalCity}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; color: #000000;">${data.departureTime}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; color: #000000;">${data.arrivalTime}</td>
              </tr>
            </tbody>
          </table>

          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; display: inline-block;">
              <p style="color: #6c757d; margin: 0;"><strong>Seat Number:</strong></p>
              <h2 style="color: #2c3e50; margin: 10px 0;">${data.seatNumber}</h2>
            </div>
          </div>

          <div style="text-align: center; margin: 20px 0;">
            <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; display: inline-block;">
              <p style="color: #27ae60; margin: 0;"><strong>Total Fare:</strong></p>
              <h2 style="color: #27ae60; margin: 10px 0;">RWF ${data.price.toLocaleString()}</h2>
            </div>
          </div>

          <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #27ae60;">Important Instructions</h4>
            <ul style="margin: 0; padding-left: 20px; color: #000000;">
              <li>Arrive at the departure point at least 30 minutes early</li>
              <li>Bring a valid ID for verification</li>
              <li>Present your booking code: <strong>${data.bookingCode}</strong></li>
              <li>Keep this email for your records</li>
            </ul>
          </div>

          <p style="color: #7f8c8d; font-size: 12px; text-align: center; margin-top: 30px;">
            This is an automated message from ${config.app.name}. Please do not reply to this email.
          </p>
        </div>
      </div>
    `;
  }

  /**
   * Generate text content for booking confirmation email
   */
  private static generateBookingConfirmationText(data: BookingEmailData): string {
    return `
${config.app.name} - BOOKING CONFIRMATION

Hello ${data.passengerName},

Your booking has been confirmed!

BOOKING DETAILS:
- Booking Code: ${data.bookingCode}
- Company: ${data.busCompany}
- Plate Number: ${data.plateNumber}
- Travel Date: ${new Date(data.travelDate).toLocaleDateString()}

JOURNEY DETAILS:
- Route: ${data.departureCity} → ${data.arrivalCity}
- Departure: ${data.departureTime}
- Arrival: ${data.arrivalTime}
- Seat Number: ${data.seatNumber}

TOTAL FARE: RWF ${data.price.toLocaleString()}

IMPORTANT INSTRUCTIONS:
- Arrive at least 30 minutes early
- Bring a valid ID for verification
- Present your booking code: ${data.bookingCode}

This is an automated message from ${config.app.name}. Please do not reply to this email.
    `.trim();
  }

  /**
   * Generate HTML content for booking cancellation email (MedConnect Theme)
   */
  private static generateBookingCancellationHTML(data: BookingCancellationEmailData): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
        <div style="background-color: #c0392b; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;"> Booking Cancelled</h1>
          <p style="margin: 5px 0 0 0;">Cancellation Confirmation</p>
        </div>
        
        <div style="padding: 20px; background-color: white;">
          <h2 style="color: #2c3e50;">Hello ${data.passengerName},</h2>
          <p style="color: #000000;">Your booking has been successfully cancelled as per your request.</p>
          
          <div style="background-color: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #e74c3c;">
            <h3 style="margin-top: 0; color: #c0392b;">Cancelled Booking Details</h3>
            <p style="color: #000000;"><strong>Booking Code:</strong> ${data.bookingCode}</p>
            <p style="color: #000000;"><strong>Route:</strong> ${data.departureCity} → ${data.arrivalCity}</p>
            <p style="color: #000000;"><strong>Travel Date:</strong> ${new Date(data.travelDate).toLocaleDateString()}</p>
            ${data.refundAmount ? `<p style="color: #000000;"><strong>Refund Amount:</strong> RWF ${data.refundAmount.toLocaleString()}</p>` : ''}
          </div>

          ${data.refundAmount ? `
          <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h4 style="margin-top: 0; color: #155724;">Refund Information</h4>
            <p style="margin: 0; color: #155724;">
              Your refund of RWF ${data.refundAmount.toLocaleString()} will be processed within 5-7 business days.
            </p>
          </div>
          ` : ''}

          <p style="color: #7f8c8d; font-size: 12px; text-align: center; margin-top: 30px;">
            This is an automated message from ${config.app.name}. Please do not reply to this email.
          </p>
        </div>
      </div>
    `;
  }

  /**
   * Generate text content for booking cancellation email
   */
  private static generateBookingCancellationText(data: BookingCancellationEmailData): string {
    return `
${config.app.name} - BOOKING CANCELLED

Hello ${data.passengerName},

Your booking has been successfully cancelled.

CANCELLED BOOKING DETAILS:
- Booking Code: ${data.bookingCode}
- Route: ${data.departureCity} → ${data.arrivalCity}
- Travel Date: ${new Date(data.travelDate).toLocaleDateString()}
${data.refundAmount ? `- Refund Amount: RWF ${data.refundAmount.toLocaleString()}` : ''}

${data.refundAmount ? `\nREFUND PROCESSING:\nYour refund will be processed within 5-7 business days.\n` : ''}

This is an automated message from ${config.app.name}. Please do not reply to this email.
    `.trim();
  }

  /**
   * Generate HTML content for booking reminder email (MedConnect Theme)
   */
  private static generateBookingReminderHTML(data: BookingReminderEmailData): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
        <div style="background-color: #f39c12; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;"> Travel Reminder</h1>
          <p style="margin: 5px 0 0 0;">Your trip is in ${data.hoursUntilDeparture} hours!</p>
        </div>
        
        <div style="padding: 20px; background-color: white;">
          <h2 style="color: #2c3e50;">Hello ${data.passengerName},</h2>
          <p style="color: #000000;">This is a friendly reminder that your bus departs in <strong>${data.hoursUntilDeparture} hours</strong>.</p>
          
          <div style="background-color: #ecf0f1; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #2c3e50;">Trip Details</h3>
            <p style="color: #000000;"><strong>Booking Code:</strong> ${data.bookingCode}</p>
            <p style="color: #000000;"><strong>Route:</strong> ${data.departureCity} → ${data.arrivalCity}</p>
            <p style="color: #000000;"><strong>Date:</strong> ${new Date(data.travelDate).toLocaleDateString()}</p>
            <p style="color: #000000;"><strong>Departure:</strong> ${data.departureTime}</p>
            <p style="color: #000000;"><strong>Company:</strong> ${data.busCompany}</p>
            <p style="color: #000000;"><strong>Plate:</strong> ${data.plateNumber}</p>
            <p style="color: #000000;"><strong>Seat:</strong> ${data.seatNumber}</p>
          </div>

          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h4 style="margin-top: 0; color: #856404;">Pre-Departure Checklist</h4>
            <ul style="margin: 0; padding-left: 20px; color: #856404;">
              <li>Arrive 30 minutes early</li>
              <li>Bring your valid ID</li>
              <li>Have your booking code ready</li>
              <li>Check the weather forecast</li>
            </ul>
          </div>

          <p style="color: #7f8c8d; font-size: 12px; text-align: center; margin-top: 30px;">
            This is an automated message from ${config.app.name}. Please do not reply to this email.
          </p>
        </div>
      </div>
    `;
  }

  /**
   * Generate text content for booking reminder email
   */
  private static generateBookingReminderText(data: BookingReminderEmailData): string {
    return `
${config.app.name} - TRAVEL REMINDER

Your trip is in ${data.hoursUntilDeparture} hours!

Hello ${data.passengerName},

TRIP DETAILS:
- Booking Code: ${data.bookingCode}
- Route: ${data.departureCity} → ${data.arrivalCity}
- Date: ${new Date(data.travelDate).toLocaleDateString()}
- Departure: ${data.departureTime}
- Company: ${data.busCompany}
- Plate: ${data.plateNumber}
- Seat: ${data.seatNumber}

PRE-DEPARTURE CHECKLIST:
✓ Arrive 30 minutes early
✓ Bring your valid ID
✓ Have your booking code ready
✓ Check the weather forecast

Have a safe journey!

This is an automated message from ${config.app.name}. Please do not reply to this email.
    `.trim();
  }
}