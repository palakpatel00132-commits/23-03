import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    index: true, // સર્ચ ફાસ્ટ કરવા માટે સિંગલ ઇન્ડેક્સ
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true, // ફિલ્ટરિંગ ફાસ્ટ કરવા માટે ઇન્ડેક્સ
  },
}, { timestamps: true });

// જો ટાઇટલ અને યુઝર બંને પર એકસાથે સર્ચ કરવું હોય તો કમ્પાઉન્ડ ઇન્ડેક્સ:
taskSchema.index({ title: 'text', created_by: 1 }); 

export default mongoose.model('Task', taskSchema);