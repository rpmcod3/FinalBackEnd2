import mongoose from 'mongoose';


const ticketSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,  
    default: () => `TICKET-${Math.floor(Math.random() * 1000000)}`, 
  },
  purchase_datetime: {
    type: Date,
    default: Date.now,  
  },
  amount: {
    type: Number,
    required: true,  
  },
  purchaser: {
    type: mongoose.Schema.Types.ObjectId,  
    ref: 'User',  
    required: true,  
  },
});


const TicketModel = mongoose.model('Ticket', ticketSchema);

export { TicketModel };



