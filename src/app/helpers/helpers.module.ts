import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { BcryptHelper } from './bcrypt.helper';
import { EmailHelper } from './email.helper';
import { FileUploadHelper } from './fileUpload.helper';
import { HtmlHelper } from './html.helper';
import { JWTHelper } from './jwt.helper';
import { PdfGeneratorHelper } from './pdfGenerator.helper';
import { SupabaseUploadHelper } from './supabaseUpload.helper';

const HELPERS = [BcryptHelper, JWTHelper, EmailHelper, HtmlHelper, FileUploadHelper, PdfGeneratorHelper, SupabaseUploadHelper];
const modules = [HttpModule];

@Global()
@Module({
  imports: [...modules],
  providers: [...HELPERS],
  exports: [...HELPERS],
})
export class HelpersModule { }
