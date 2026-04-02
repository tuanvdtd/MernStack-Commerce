import pkg from 'lodash';
const { pick } = pkg;

const getInfoData = ({object = {}, keys = []}) => {
  return pick(object, keys)
}

export default getInfoData;