/**
 * Đầu vào: a = { name: 'abc', age: 18, address: { city: 'HCM', street: 'Nguyen Van Linh' } }
 * tham số {data} data 
 * Đầu ra: { name: 'abc', age: 18, address.city: 'HCM', address.street: 'Nguyen Van Linh' }
 */
export const formatDataForUpdate = (data = {}) => {
  // init object result
  const result = {}
  Object.keys(data).forEach(key => {
    // Nếu là nésted object thì gọi đệ quy, phải kiếm tra null vì typeof null === 'object'
    if (typeof data[key] === 'object' && !Array.isArray(data[key]) && data[key] !== null) {
      const nestedData = formatDataForUpdate(data[key])
      Object.keys(nestedData).forEach(nestedKey => {
        if (nestedData[nestedKey] != null) {
          result[`${key}.${nestedKey}`] = nestedData[nestedKey]
        }
      })
    } else if (data[key] != null) {
      result[key] = data[key]
    }
  })
  return result
}

// Đã tối ưu hàm bên trên nên hàm này không cần dùng nữa
export const removeUndefinedFields = (data = {}) => {
  Object.keys(data).forEach(key => {
    if (data[key] == null) {
      delete data[key]
    }
  })
  return data
}

export const randomProductId = () => {
  const randomId = `${Math.floor(100000 + Math.random() * 899999)}`;
  return randomId;
}