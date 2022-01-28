const { UitkeringsApi, FileConnector } = require('../UitkeringsApi');
test('Uitkeringsapi returns empty', async () => {
    let api = new UitkeringsApi('00000000', FileConnector);
    const result = await api.getUitkeringen();
    expect(result).toHaveLength(0);
  });
  
  test('Uitkeringsapi returns one uitkering', async () => {
    const api = new UitkeringsApi('12345678', FileConnector);
    const result = await api.getUitkeringen();
    expect(result).toHaveLength(1);
  });