import dotenv from 'dotenv';
dotenv.config();

import '../../nodekit';
import {registry} from '../../registry';

if (require.main === module) {
    const {helpers} = registry.getDbInstance();
    helpers
        .rollbackDatabase()
        .then(() => {
            process.exit(0);
        })
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}
