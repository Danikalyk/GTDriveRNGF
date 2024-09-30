function compareVersions(version1, version2) {
  // Разбиваем версии на массивы чисел
  const v1 = version1.split('.').map(Number);
  const v2 = version2.split('.').map(Number);

  // Делаем их одинаковой длины, добавляя недостающие нули
  while (v1.length < v2.length) v1.push(0);
  while (v2.length < v1.length) v2.push(0);

  // Сравниваем версии по частям
  for (let i = 0; i < v1.length; i++) {
    if (v1[i] > v2[i]) return 1; // version1 больше
    if (v1[i] < v2[i]) return -1; // version2 больше
  }

  return 0; // версии равны
}

export default compareVersions;
