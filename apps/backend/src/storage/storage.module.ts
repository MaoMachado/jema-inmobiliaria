import { Module } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { StorageService } from './storage.service';

@Module({
  providers: [
    {
      provide: SupabaseClient,
      useFactory: () =>
        createClient(
          process.env.SUPABASE_URL || '',
          process.env.SUPABASE_SERVICE_ROLE_KEY || '',
        ),
    },
    StorageService,
  ],

  exports: [StorageService],
})
export class StorageModule {}
