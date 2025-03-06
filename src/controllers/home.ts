import {Request, Response} from '@gravity-ui/expresskit';

export const homeController = async (_: Request, res: Response) => {
    res.send('hey');
};
