const pool = require('./src/db/database');

async function initializeDatabase() {
    try {
        console.log('🔄 Verificando conexión a la base de datos...');
        
        const connection = await pool.getConnection();
        console.log('✅ Conexión exitosa a la base de datos');
        
        // Verificar si las tablas existen
        const [tables] = await connection.execute(`
            SELECT TABLE_NAME 
            FROM information_schema.tables 
            WHERE table_schema = ?
        `, [process.env.DB_NAME]);
        
        console.log(`📊 Tablas encontradas: ${tables.length}`);
        tables.forEach(table => {
            console.log(`  - ${table.TABLE_NAME}`);
        });
        
        connection.release();
        
        if (tables.length === 0) {
            console.log('⚠️  No se encontraron tablas. Ejecuta las migraciones:');
            console.log('   npx knex migrate:latest');
        }
        
    } catch (error) {
        console.error('❌ Error conectando a la base de datos:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    initializeDatabase();
}

module.exports = initializeDatabase;