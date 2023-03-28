import { v4 as uuidv4 } from 'uuid';
import {Reference, Slug} from "@sanity/types";

const convertToSlugStr = (slugStr: string) => {
  return slugStr
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
};
const convertToSlugObj = (slugStr: string): Slug => {
  return {
    _type: 'slug',
    current: slugStr,
  };
};
const getSanityDocumentRef = (
  sanityId: string,
  isWeak?: boolean,
  setKey?: boolean,
): Reference => {
  let ref: any = {
    _type: 'reference',
    _ref: sanityId,
    weak: isWeak,
  };
  if (setKey) {
    ref = { ...ref, _key: uuidv4() };
  }
  return ref;
};


const getSanityKeyedValue = (value: any) => {
  return {
    _key: uuidv4(),
    value,
  };
};

export default {
  convertToSlugObj,
  getSanityDocumentRef,
  getSanityKeyedValue,
  convertToSlugStr,
};
