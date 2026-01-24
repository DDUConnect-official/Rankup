import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Level from '../src/models/Level.js';

dotenv.config();

/**
 * Migration Script: Convert Level Content from Theory (with type) to Simple Content Array
 * 
 * Old Format: theory: [{ type: "paragraph/bullet", content: "text" }]
 * New Format: content: ["text1", "text2", ...]
 */

const migrateLevels = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        console.log('');

        // Find all levels with old 'theory' field
        const levels = await Level.find({ theory: { $exists: true } });

        if (levels.length === 0) {
            console.log('ℹ️  No levels found with old format. Migration not needed.');
            process.exit(0);
        }

        console.log(`📋 Found ${levels.length} level(s) to migrate\n`);

        let successCount = 0;
        let errorCount = 0;

        for (const level of levels) {
            try {
                const newContent = [];

                // Convert each theory block to paragraph format
                for (const block of level.theory) {
                    // Simply extract the content, ignoring the type
                    // Both paragraph and bullet types become regular paragraphs
                    newContent.push(block.content);
                }

                // Update level with new content format
                await Level.updateOne(
                    { _id: level._id },
                    {
                        $set: { content: newContent },
                        $unset: { theory: 1 }  // Remove old field
                    }
                );

                successCount++;
                console.log(`✓ Migrated: "${level.title}"`);
                console.log(`  - Converted ${level.theory.length} block(s) to ${newContent.length} paragraph(s)`);

            } catch (err) {
                errorCount++;
                console.error(`✗ Failed to migrate: "${level.title}"`);
                console.error(`  Error: ${err.message}`);
            }
        }

        console.log('');
        console.log('═'.repeat(60));
        console.log('📊 Migration Summary:');
        console.log(`  ✅ Successful: ${successCount}`);
        console.log(`  ❌ Failed: ${errorCount}`);
        console.log(`  📝 Total: ${levels.length}`);
        console.log('═'.repeat(60));

        if (errorCount === 0) {
            console.log('\n🎉 Migration completed successfully!');
        } else {
            console.log('\n⚠️  Migration completed with errors. Please review failed items.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

// Run migration
console.log('🚀 Starting Level Content Migration...\n');
migrateLevels();
