import { applyDecorators, UseGuards } from '@nestjs/common';
import { FingerprintSubmissionGuard } from '../modules/auth/guards/fingerprint-submission.guard';

export const LimitFingerprintSubmissions = (): ReturnType<typeof applyDecorators> => {
  return applyDecorators(UseGuards(FingerprintSubmissionGuard));
};
