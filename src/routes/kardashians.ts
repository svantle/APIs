import { Router, Request, Response } from 'express';
import sharp from 'sharp';
import {
    getRandomImageFromSubfolder,
    getImageDataFromS3,
    getCountOfImagesInSubfolder
} from '../utils/s3Utility';

const availableKardashians = [
    'kris',
    'caitlyn',
    'kendall',
    'kylie',
    'kourtney',
    'kim',
    'khloe',
    'rob'
];

const router = Router();

router.get('/kardashians', (req: Request, res: Response) => {
    console.log("Accessed /kardashians");
    return res.json(availableKardashians);
});

router.get('/kardashians/:name', async (req: Request, res: Response) => {
    console.log(`Accessed /kardashians/${req.params.name}`);
    const { name } = req.params;

    if (!availableKardashians.includes(name.toLowerCase())) {
        return res.status(400).json({ error: "Invalid Kardashian name provided." });
    }

    try {
        const imageCount = await getCountOfImagesInSubfolder(`kardashians/${name}`);
        return res.json({ name, imageCount });
    } catch (error) {
        const errorMsg = (error instanceof Error) ? error.message : "Internal Server Error while fetching image count.";
        res.status(500).json({ error: errorMsg });
    }
});

router.get('/kardashians/:name/random', async (req: Request, res: Response) => {
    const { name } = req.params;
    const resolution = req.query.res as string;

    if (!availableKardashians.includes(name.toLowerCase())) {
        return res.status(400).json({ error: "Invalid Kardashian name provided." });
    }

    try {
        const randomImagePath = await getRandomImageFromSubfolder(`kardashians/${name}`);

        if (!randomImagePath) {
            return res.status(404).json({ error: `No images found for ${name}.` });
        }

        const imageObject = await getImageDataFromS3(randomImagePath);

        let imageBuffer = imageObject.Body as Buffer;

        // Resize if resolution is provided
        if (resolution) {
            const [width, height] = resolution.split('x').map(Number);
            imageBuffer = await sharp(imageBuffer).resize(width, height).toBuffer();
        }

        res.writeHead(200, {'Content-Type': 'image/jpeg'});
        res.write(imageBuffer);
        res.end();

    } catch (error) {
        const errorMsg = (error instanceof Error) ? error.message : "Internal Server Error while fetching image.";
        res.status(500).json({ error: errorMsg });
    }
});

export default router;
