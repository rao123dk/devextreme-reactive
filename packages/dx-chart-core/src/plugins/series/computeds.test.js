
import {
  symbol,
  symbolCircle,
  curveCatmullRom,
  arc,
  area,
  line,
} from 'd3-shape';
import { createScale, getWidth } from '../../utils/scale';
import {
  pieAttributes,
  xyScales,
  pointAttributes,
  coordinates,
  findSeriesByName,
  seriesData,
  barCoordinates,
  getPieItems,
} from './computeds';

jest.mock('../../utils/scale', () => ({
  createScale: jest.fn(),
  getWidth: jest.fn(),
}));

jest.mock('d3-shape', () => {
  const createMockWithFluentInterface = () => {
    const proxy = new Proxy(jest.fn().mockReturnValue('symbol path'), {
      get(target, prop, receiver) {
        if (target[prop] === undefined) {
          const mock = target[prop] || jest.fn().mockReturnValue(receiver);
          // eslint-disable-next-line no-param-reassign
          target[prop] = mock;
        }
        return target[prop];
      },
    });
    return jest.fn().mockReturnValue(proxy);
  };

  const mockPie = {
    value: jest.fn(func => data => data.map(d => ({
      startAngle: func(d), endAngle: func(d), value: 'value', data: d,
    }))),
    sort: jest.fn().mockReturnThis(),
  };

  return {
    area: createMockWithFluentInterface(),
    line: createMockWithFluentInterface(),
    symbol: createMockWithFluentInterface(),
    pie: jest.fn().mockReturnValue(mockPie),
    arc: createMockWithFluentInterface(),
  };
});


const data = [
  {
    arg: 1, val1: 3,
  },
  {
    arg: 2, val1: 5,
  },
  {
    arg: 3, val1: 7,
  },
  {
    arg: 4, val1: 10,
  },
  {
    arg: 5, val1: 15,
  },
];

const dataWithUndefined = [
  {
    arg: 1, val1: 3,
  },
  {
    arg: undefined, val1: 5,
  },
  {
    arg: 3, val1: 7,
  },
  { arg: 4, val1: undefined },
  {
    arg: 5, val1: 15,
  },
];

const computedLine = data.map((item, index) => ({
  id: index, x: item.arg + 5, y: item.val1, y1: 10, value: item.val1,
}));

const groupWidth = 0.7;

describe('dArea', () => {
  it('init function', () => {
    expect(area).toHaveBeenCalledTimes(1);
  });

  it('x getter', () => {
    const fluentArea = area.mock.results[0].value;
    const getX = fluentArea.x.mock.calls[0][0];

    expect(fluentArea.x).toHaveBeenCalledTimes(1);
    expect(getX({ x: 10 })).toEqual(10);
  });

  it('y1 getter', () => {
    const fluentArea = area.mock.results[0].value;
    const getY = fluentArea.y1.mock.calls[0][0];

    expect(fluentArea.y1).toHaveBeenCalledTimes(1);
    expect(getY({ y: 10 })).toEqual(10);
  });

  it('y0 getter', () => {
    const fluentArea = area.mock.results[0].value;
    const getY = fluentArea.y0.mock.calls[0][0];

    expect(fluentArea.y0).toHaveBeenCalledTimes(1);
    expect(getY({ y1: 5 })).toEqual(5);
  });
});

describe('line & spline', () => {
  it('init function', () => {
    expect(line).toHaveBeenCalledTimes(2);
  });

  it('x & y  getters', () => {
    const fluentLine = line.mock.results[0].value;
    expect(fluentLine.x).toHaveBeenCalledTimes(2);
    expect(fluentLine.y).toHaveBeenCalledTimes(2);
  });

  describe('dLine', () => {
    it('x getter', () => {
      const getX = line.mock.results[0].value.x.mock.calls[0][0];

      expect(getX({ x: 10 })).toEqual(10);
    });

    it('y1 getter', () => {
      const getY = line.mock.results[0].value.y.mock.calls[0][0];

      expect(getY({ y: 10 })).toEqual(10);
    });
  });

  describe('dSpline', () => {
    it('x getter', () => {
      const getX = line.mock.results[0].value.x.mock.calls[1][0];

      expect(getX({ x: 10 })).toEqual(10);
    });

    it('y1 getter', () => {
      const getY = line.mock.results[0].value.y.mock.calls[1][0];

      expect(getY({ y: 10 })).toEqual(10);
    });

    it('curve', () => {
      const curve = line.mock.results[0].value.curve.mock.calls[0][0];

      expect(curve).toEqual(curveCatmullRom);
    });
  });
});

describe('barCoordinates', () => {
  beforeAll(() => {
    const translateValue = value => (value !== 0 ? value : 10);
    createScale.mockImplementation(() => translateValue);
    getWidth.mockImplementation(() => 10);
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('should return array object with x, width properties', () => {
    const result = barCoordinates(
      data,
      { xScale: createScale(), yScale: createScale() },
      { argumentField: 'arg', valueField: 'val1', stack: null },
      undefined,
      [
        { type: 'band', constructor: 'bandConstructor' },
      ],
    );

    expect(result).toEqual([{
      id: 0, value: 3, width: 10, x: 1, y: 3, y1: 10,
    }, {
      id: 1, value: 5, width: 10, x: 2, y: 5, y1: 10,
    }, {
      id: 2, value: 7, width: 10, x: 3, y: 7, y1: 10,
    }, {
      id: 3, value: 10, width: 10, x: 4, y: 10, y1: 10,
    }, {
      id: 4, value: 15, width: 10, x: 5, y: 15, y1: 10,
    }]);
  });
});

describe('Scales', () => {
  const defaultOptions = [
    { type: 'argumentType', orientation: 'orientation' },
    { type: 'valueType' },
    { width: 20, height: 10 },
    0.7,
    [
      { type: 'argumentType', constructor: 'argumentConstructor' },
      { type: 'valueType', constructor: 'valueConstructor' },
      { type: 'band', constructor: 'bandConstructor' },
    ],
  ];

  beforeAll(() => {
    const translateValue = value => value;
    createScale.mockImplementation(() => translateValue);
  });

  afterAll(jest.clearAllMocks);

  it('should create scales with proper parameters', () => {
    const { xScale, yScale } = xyScales(...defaultOptions);

    expect(createScale).toHaveBeenCalledTimes(2);
    expect(createScale.mock.calls[0]).toEqual([{ type: 'argumentType', orientation: 'orientation' }, 20, 10, 'argumentConstructor', 1 - groupWidth]);
    expect(createScale.mock.calls[1]).toEqual([{ type: 'valueType' }, 20, 10, 'valueConstructor']);
    expect(xScale).toBeTruthy();
    expect(yScale).toBeTruthy();
  });
});

describe('Series attributes', () => {
  beforeAll(() => {
    const translateValue = value => (value !== 0 ? value : 10);
    createScale.mockImplementation(() => translateValue);
  });

  afterAll(jest.clearAllMocks);

  it('should return series by name', () => {
    const seriesSymbol = Symbol('Series2');
    const series = [{ symbolName: Symbol('Series2') }, { symbolName: seriesSymbol }, { symbolName: Symbol('Series3') }];
    expect(findSeriesByName(seriesSymbol, series)).toEqual(series[1]);
  });

  it('should return d attribute for point and coordinates', () => {
    const { d, x, y } = pointAttributes({ xScale: {} }, {})({ x: 1, y: 2 });
    expect(d).toBe('symbol path');
    expect(symbol.mock.results[0].value.size).toBeCalledWith([49]);
    expect(symbol.mock.results[0].value.type).toBeCalledWith(symbolCircle);
    expect(x).toBe(1);
    expect(y).toBe(2);
  });

  it('should return coordinates for path', () => {
    expect(coordinates(
      data,
      { xScale: createScale(), yScale: createScale() },
      { argumentField: 'arg', valueField: 'val1' },
    )).toEqual(computedLine);
  });

  it('should return coordinates for path, some value and argument fields are undefined', () => {
    expect(coordinates(
      dataWithUndefined,
      { xScale: createScale(), yScale: createScale() },
      { argumentField: 'arg', valueField: 'val1' },
    )).toEqual([
      {
        id: 0, x: 6, y: 3, y1: 10, value: 3,
      },
      {
        id: 2, x: 8, y: 7, y1: 10, value: 7,
      },
      {
        id: 4, x: 10, y: 15, y1: 10, value: 15,
      },
    ]);
  });
});

describe('Pie attributes', () => {
  it('should return array of arcs', () => {
    const getScale = () => ({ range: jest.fn().mockReturnValue([10]) });
    const pieAttr = pieAttributes(
      data,
      { xScale: getScale(), yScale: getScale() },
      {
        argumentField: 'arg', valueField: 'val1', innerRadius: 0.3, outerRadius: 0.5,
      },
    );

    expect(pieAttr).toHaveLength(data.length);
    pieAttr.forEach((attr, index) => {
      expect(attr.d).toBeTruthy();
      expect(attr.value).toBe('value');
      expect(attr.data).toEqual(data[index]);
      expect(attr.id).toEqual(data[index].arg);
      expect(attr.x).toEqual(5);
      expect(attr.y).toEqual(5);
    });
    data.forEach((d) => {
      expect(arc.mock.results[0].value.innerRadius).toHaveBeenCalledWith(1.5);
      expect(arc.mock.results[0].value.outerRadius).toHaveBeenCalledWith(2.5);
      expect(arc.mock.results[0].value.startAngle).toHaveBeenCalledWith(d.val1);
      expect(arc.mock.results[0].value.endAngle).toHaveBeenCalledWith(d.val1);
    });
  });
});

describe('seriesData', () => {
  it('should return array with props', () => {
    const seriesArray = seriesData(undefined, { first: true });
    expect(seriesArray).toEqual([{ first: true }]);
  });

  it('should push new series props', () => {
    const seriesArray = seriesData([{ uniqueName: 'defaultName' }], { uniqueName: 'defaultName' });
    expect(seriesArray).toEqual([{ uniqueName: 'defaultName' }, { uniqueName: 'defaultName0' }]);
  });

  it('should push new  props', () => {
    const seriesArray = seriesData([{ uniqueName: 'defaultName0' }], { uniqueName: 'defaultName0' });
    expect(seriesArray).toEqual([{ uniqueName: 'defaultName0' }, { uniqueName: 'defaultName1' }]);
  });
});

describe('#getPieItems', () => {
  it('should return function returns items of series', () => {
    expect(getPieItems(undefined, ['name1', 'name2'])).toEqual([{ uniqueName: 'name1' }, { uniqueName: 'name2' }]);
  });
});
