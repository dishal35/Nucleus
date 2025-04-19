import Otp from '../models/Otp.js';
import randomstring from 'randomstring';
import { Op } from 'sequelize';
import AppError from '../utils/AppError.js';
import sendResponse from '../utils/sendResponse.js';
import { StatusCodes } from 'http-status-codes';

// Generate OTP
function generateOTP() {
    return randomstring.generate({
        length: 6,
        charset: 'numeric'
    });
}

// Send OTP to the provided email
export const sendOTP = async (req, res, next) => {
    try {
        const { email } = req.body;
        const otp = generateOTP(); // Generate a 6-digit OTP
        const newOTP = await Otp.create({ email, otp });
        await newOTP.save();
        
        const expirationTime = new Date(Date.now() + 10 * 60 * 1000); 
        await Otp.update({ expiresAt: expirationTime }, { where: { email } });
       
       
        const emailData = {
            to: req.user.email,
            subject: "Reset Password OTP",
            text: `Your OTP for password reset is: ${otp}. Valid for 10 minutes.`     
        };
        await sendToQueue("emailQueue", emailData); 
        
        res.status(200).json({ success: true, message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

export const verifyOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            throw new AppError("Email and OTP are required", StatusCodes.BAD_REQUEST);
        }

        // Find the OTP entry and check expiration
        const existingOTP = await Otp.findOne({
            where: {
                email,
                otp,
                expiresAt: { [Op.gt]: new Date() }, // Ensure OTP hasn't expired
            },
        });

        if (!existingOTP) {
            throw new AppError("Invalid or expired OTP", StatusCodes.BAD_REQUEST);
        }

        // OTP is valid, delete it
        await existingOTP.destroy();

        sendResponse(res, StatusCodes.OK, true, "OTP verification successful");
    } catch (error) {
        console.error("Error verifying OTP:", error);
        next(new AppError(error.message || "Internal Server Error", StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

