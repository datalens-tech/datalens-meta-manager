import PowerRadix from 'power-radix';

import {BigIntId, StringId} from '../types/id';

const CODING_BASE = '0123456789abcdefghijklmnopqrstuvwxyz'.split('');

function rotate(array: string[], start: number) {
    return array.slice(start, array.length).concat(array.slice(0, start));
}

export const encodeId = (bigIntId: BigIntId): StringId => {
    let encodedId = '';

    if (bigIntId) {
        const bigIntIdShortPart = bigIntId.slice(-2);

        const rotationNumber = Number(bigIntIdShortPart) % CODING_BASE.length;
        const rotatedCodingBase = rotate(CODING_BASE, rotationNumber);

        const encodedLongPart = new PowerRadix(bigIntId, 10).toString(rotatedCodingBase);
        const encodedRotationNumber = new PowerRadix(rotationNumber, 10).toString(CODING_BASE);

        encodedId = encodedLongPart + encodedRotationNumber;
    }

    return encodedId as StringId;
};

export const decodeId = (stringId: StringId): BigIntId => {
    let decodedId = '';

    if (stringId) {
        const encodedRotationNumber = stringId.slice(-1);
        const encodedLongPart = stringId.slice(0, -1);

        const decodedRotationNumber = Number(
            new PowerRadix(
                encodedRotationNumber,
                CODING_BASE as unknown as number[], // @types/power-radix mistake
            ).toString(10),
        );
        const rotatedCodingBase = rotate(CODING_BASE, decodedRotationNumber);

        const decodedLongPart = new PowerRadix(
            encodedLongPart,
            rotatedCodingBase as unknown as number[], // @types/power-radix mistake
        ).toString(10);

        decodedId = decodedLongPart;
    }

    return decodedId as BigIntId;
};
