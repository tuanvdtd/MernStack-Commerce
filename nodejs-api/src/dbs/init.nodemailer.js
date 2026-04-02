import nodemailer from 'nodemailer';

const transport = nodemailer.createTransport({
  host: 'email-smtp.ap-southeast-1.amazonaws.com',
  port: 465,
  secure: true,
  auth: {
    user: 'AKIA45W7WGZBCLIDGPGC',
    pass: 'BK9TllDhe+6nBtD27dpJSAM+gTTL+vJ2imrVS+OqfLYk'
  }
})

export default transport;