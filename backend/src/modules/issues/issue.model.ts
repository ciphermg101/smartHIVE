import { Schema, model, Document, Types } from 'mongoose';
import { IssueStatus } from '@modules/issues/issue.enum';

export interface IIssue extends Document {
  title: string;
  description: string;
  fileUrl?: string;
  status: IssueStatus;
  reporterId: string;
  unitId: string;
  createdAt: Date;
  updatedAt: Date;
}

const issueSchema = new Schema<IIssue>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  fileUrl: { type: String },
  status: { type: String, enum: Object.values(IssueStatus), default: IssueStatus.OPEN },
  reporterId: { type: String, required: true },
  unitId: { type: String, required: true },
}, { timestamps: true });

export const Issue = model<IIssue>('Issue', issueSchema); 