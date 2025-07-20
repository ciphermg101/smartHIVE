import { Schema, model, Document, Types } from 'mongoose';
import { IssueStatus } from '@modules/issues/issue.enum';

export interface IIssue extends Document {
  title: string;
  description: string;
  fileUrl?: string;
  status: IssueStatus;
  reporterId: Types.ObjectId;
  unitId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const issueSchema = new Schema<IIssue>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  fileUrl: { type: String },
  status: { type: String, enum: Object.values(IssueStatus), default: IssueStatus.OPEN },
  reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  unitId: { type: Schema.Types.ObjectId, ref: 'Unit', required: true },
}, { timestamps: true });

export const Issue = model<IIssue>('Issue', issueSchema); 