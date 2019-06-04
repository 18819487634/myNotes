/* eslint-disable */
var XYZ = { X: 0.0, Y: 0.0, Z: 0.0 };
var xyY = { x: 0.0, y: 0.0, Y: 0.0 };
var Lab = { L: 0.0, a: 0.0, b: 0.0 };
var Luv = { L: 0.0, u: 0.0, v: 0.0 };
var LCHab = { L: 0.0, C: 0.0, H: 0.0 };
var LCHuv = { L: 0.0, C: 0.0, H: 0.0 };
var RGB = { R: 0.0, G: 0.0, B: 0.0 };
var CCT = 5000.0;
var DomWavelengthNm = 0.0;
var Gamma = 1.0;
var GammaRGB = 1.0;
var GammaRGBIndex = 0.0;
var RefWhite = { X: 0.0, Y: 0.0, Z: 0.0 };
var ScaleXYZ = false;
var ScaleY = false;
var ScaleRGB = true;
var kE = 216.0 / 24389.0;
var kK = 24389.0 / 27.0;
var kKE = 8.0;
var AdaptationMethod = 0;
var RefWhiteRGB = { X: 0.0, Y: 0.0, Z: 0.0 };
var MtxRGB2XYZ = {
  m00: 1.0,
  m01: 0.0,
  m02: 0.0,
  m10: 0.0,
  m11: 1.0,
  m12: 0.0,
  m20: 0.0,
  m21: 0.0,
  m22: 1.0,
};
var MtxXYZ2RGB = {
  m00: 1.0,
  m01: 0.0,
  m02: 0.0,
  m10: 0.0,
  m11: 1.0,
  m12: 0.0,
  m20: 0.0,
  m21: 0.0,
  m22: 1.0,
};
var MtxToRGB = {
  m00: 1.0,
  m01: 0.0,
  m02: 0.0,
  m10: 0.0,
  m11: 1.0,
  m12: 0.0,
  m20: 0.0,
  m21: 0.0,
  m22: 1.0,
};
var MtxFromRGB = {
  m00: 1.0,
  m01: 0.0,
  m02: 0.0,
  m10: 0.0,
  m11: 1.0,
  m12: 0.0,
  m20: 0.0,
  m21: 0.0,
  m22: 1.0,
};
var MtxAdaptMa = {
  m00: 1.0,
  m01: 0.0,
  m02: 0.0,
  m10: 0.0,
  m11: 1.0,
  m12: 0.0,
  m20: 0.0,
  m21: 0.0,
  m22: 1.0,
};
var MtxAdaptMaI = {
  m00: 1.0,
  m01: 0.0,
  m02: 0.0,
  m10: 0.0,
  m11: 1.0,
  m12: 0.0,
  m20: 0.0,
  m21: 0.0,
  m22: 1.0,
};

/* 360nm to 830nm in 5nm increments */
var CIE1931StdObs_x = [
  0.0001299,
  0.0002321,
  0.0004149,
  0.0007416,
  0.001368,
  0.002236,
  0.004243,
  0.00765,
  0.01431,
  0.02319,
  0.04351,
  0.07763,
  0.13438,
  0.21477,
  0.2839,
  0.3285,
  0.34828,
  0.34806,
  0.3362,
  0.3187,
  0.2908,
  0.2511,
  0.19536,
  0.1421,
  0.09564,
  0.05795001,
  0.03201,
  0.0147,
  0.0049,
  0.0024,
  0.0093,
  0.0291,
  0.06327,
  0.1096,
  0.1655,
  0.2257499,
  0.2904,
  0.3597,
  0.4334499,
  0.5120501,
  0.5945,
  0.6784,
  0.7621,
  0.8425,
  0.9163,
  0.9786,
  1.0263,
  1.0567,
  1.0622,
  1.0456,
  1.0026,
  0.9384,
  0.8544499,
  0.7514,
  0.6424,
  0.5419,
  0.4479,
  0.3608,
  0.2835,
  0.2187,
  0.1649,
  0.1212,
  0.0874,
  0.0636,
  0.04677,
  0.0329,
  0.0227,
  0.01584,
  0.01135916,
  0.008110916,
  0.005790346,
  0.004109457,
  0.002899327,
  0.00204919,
  0.001439971,
  0.0009999493,
  0.0006900786,
  0.0004760213,
  0.0003323011,
  0.0002348261,
  0.0001661505,
  0.000117413,
  0.00008307527,
  0.00005870652,
  0.00004150994,
  0.00002935326,
  0.00002067383,
  0.00001455977,
  0.00001025398,
  0.000007221456,
  0.000005085868,
  0.000003581652,
  0.000002522525,
  0.000001776509,
  0.000001251141,
];
var CIE1931StdObs_y = [
  0.000003917,
  0.000006965,
  0.00001239,
  0.00002202,
  0.000039,
  0.000064,
  0.00012,
  0.000217,
  0.000396,
  0.00064,
  0.00121,
  0.00218,
  0.004,
  0.0073,
  0.0116,
  0.01684,
  0.023,
  0.0298,
  0.038,
  0.048,
  0.06,
  0.0739,
  0.09098,
  0.1126,
  0.13902,
  0.1693,
  0.20802,
  0.2586,
  0.323,
  0.4073,
  0.503,
  0.6082,
  0.71,
  0.7932,
  0.862,
  0.9148501,
  0.954,
  0.9803,
  0.9949501,
  1.0,
  0.995,
  0.9786,
  0.952,
  0.9154,
  0.87,
  0.8163,
  0.757,
  0.6949,
  0.631,
  0.5668,
  0.503,
  0.4412,
  0.381,
  0.321,
  0.265,
  0.217,
  0.175,
  0.1382,
  0.107,
  0.0816,
  0.061,
  0.04458,
  0.032,
  0.0232,
  0.017,
  0.01192,
  0.00821,
  0.005723,
  0.004102,
  0.002929,
  0.002091,
  0.001484,
  0.001047,
  0.00074,
  0.00052,
  0.0003611,
  0.0002492,
  0.0001719,
  0.00012,
  0.0000848,
  0.00006,
  0.0000424,
  0.00003,
  0.0000212,
  0.00001499,
  0.0000106,
  0.0000074657,
  0.0000052578,
  0.0000037029,
  0.0000026078,
  0.0000018366,
  0.0000012934,
  0.00000091093,
  0.00000064153,
  0.00000045181,
];
var CIE1931StdObs_z = [
  0.0006061,
  0.001086,
  0.001946,
  0.003486,
  0.006450001,
  0.01054999,
  0.02005001,
  0.03621,
  0.06785001,
  0.1102,
  0.2074,
  0.3713,
  0.6456,
  1.0390501,
  1.3856,
  1.62296,
  1.74706,
  1.7826,
  1.77211,
  1.7441,
  1.6692,
  1.5281,
  1.28764,
  1.0419,
  0.8129501,
  0.6162,
  0.46518,
  0.3533,
  0.272,
  0.2123,
  0.1582,
  0.1117,
  0.07824999,
  0.05725001,
  0.04216,
  0.02984,
  0.0203,
  0.0134,
  0.008749999,
  0.005749999,
  0.0039,
  0.002749999,
  0.0021,
  0.0018,
  0.001650001,
  0.0014,
  0.0011,
  0.001,
  0.0008,
  0.0006,
  0.00034,
  0.00024,
  0.00019,
  0.0001,
  0.00004999999,
  0.00003,
  0.00002,
  0.00001,
  0.0,
  0.0,
  0.0,
  0.0,
  0.0,
  0.0,
  0.0,
  0.0,
  0.0,
  0.0,
  0.0,
  0.0,
  0.0,
  0.0,
  0.0,
  0.0,
  0.0,
  0.0,
  0.0,
  0.0,
  0.0,
  0.0,
  0.0,
  0.0,
  0.0,
  0.0,
  0.0,
  0.0,
  0.0,
  0.0,
  0.0,
  0.0,
  0.0,
  0.0,
  0.0,
  0.0,
  0.0,
];

function Determinant3x3(m) {
  var det =
    m.m00 * (m.m22 * m.m11 - m.m21 * m.m12) -
    m.m10 * (m.m22 * m.m01 - m.m21 * m.m02) +
    m.m20 * (m.m12 * m.m01 - m.m11 * m.m02);

  return det;
}

function MtxInvert3x3(m, i) {
  var scale = 1.0 / Determinant3x3(m);

  i.m00 = scale * (m.m22 * m.m11 - m.m21 * m.m12);
  i.m01 = -scale * (m.m22 * m.m01 - m.m21 * m.m02);
  i.m02 = scale * (m.m12 * m.m01 - m.m11 * m.m02);

  i.m10 = -scale * (m.m22 * m.m10 - m.m20 * m.m12);
  i.m11 = scale * (m.m22 * m.m00 - m.m20 * m.m02);
  i.m12 = -scale * (m.m12 * m.m00 - m.m10 * m.m02);

  i.m20 = scale * (m.m21 * m.m10 - m.m20 * m.m11);
  i.m21 = -scale * (m.m21 * m.m00 - m.m20 * m.m01);
  i.m22 = scale * (m.m11 * m.m00 - m.m10 * m.m01);
}

function MtxTranspose3x3(m) {
  var v = m.m01;
  m.m01 = m.m10;
  m.m10 = v;

  v = m.m02;
  m.m02 = m.m20;
  m.m20 = v;

  v = m.m12;
  m.m12 = m.m21;
  m.m21 = v;
}

function DominantWavelength(x, y, xr, yr) {
  var dominantWavelength;
  var count = 0;
  var tArray = [0.0, 0.0]; // t
  var wArray = [0.0, 0.0]; // wavelength
  var cArray = [0, 0]; // cycle

  var nm;

  var a = x - xr;
  var b = y - yr;

  if (a >= -0.000001 && a <= 0.000001 && b >= -0.000001 && b <= 0.000001) {
    return 0.0; // cannot compute the dominant wavelength, because (x, y) is the same as (xr, yr)
  }

  for (nm = 360; nm <= 830; nm += 5) {
    var i1 = (nm - 360) / 5;
    var i2 = nm == 830 ? 0 : i1 + 1;
    var nm2 = 5 * i2 + 360;

    var x1 =
      CIE1931StdObs_x[i1] / (CIE1931StdObs_x[i1] + CIE1931StdObs_y[i1] + CIE1931StdObs_z[i1]);
    var y1 =
      CIE1931StdObs_y[i1] / (CIE1931StdObs_x[i1] + CIE1931StdObs_y[i1] + CIE1931StdObs_z[i1]);
    var x2 =
      CIE1931StdObs_x[i2] / (CIE1931StdObs_x[i2] + CIE1931StdObs_y[i2] + CIE1931StdObs_z[i2]);
    var y2 =
      CIE1931StdObs_y[i2] / (CIE1931StdObs_x[i2] + CIE1931StdObs_y[i2] + CIE1931StdObs_z[i2]);

    var c = x1 - xr;
    var d = y1 - yr;
    var e = x2 - x1;
    var f = y2 - y1;

    var s = (a * d - b * c) / (b * e - a * f);
    if (s < 0.0 || s >= 1.0) {
      continue;
    }

    var t = Math.abs(a) >= Math.abs(b) ? (e * s + c) / a : (f * s + d) / b;
    tArray[count] = t;
    cArray[count] = nm;
    wArray[count] = (nm2 - nm) * s + nm;
    count += 1;
  }

  if (cArray[1] == 830 && tArray[1] > 0.0) {
    dominantWavelength = -wArray[0];
  } else {
    dominantWavelength = tArray[0] >= 0.0 ? wArray[0] : wArray[1];
  }

  return dominantWavelength;
}

function ClearForm(theForm) {
  theForm.XYZ_X = '';
  theForm.XYZ_Y = '';
  theForm.XYZ_Z = '';

  theForm.xyY_x = '';
  theForm.xyY_y = '';
  theForm.xyY_Y = '';

  theForm.Lab_L = '';
  theForm.Lab_a = '';
  theForm.Lab_b = '';

  theForm.LCHab_L = '';
  theForm.LCHab_C = '';
  theForm.LCHab_H = '';

  theForm.Luv_L = '';
  theForm.Luv_u = '';
  theForm.Luv_v = '';

  theForm.LCHuv_L = '';
  theForm.LCHuv_C = '';
  theForm.LCHuv_H = '';

  theForm.RGB_R = '';
  theForm.RGB_G = '';
  theForm.RGB_B = '';

  theForm.K = '';
  theForm.DomWavelength = '';
}

function ButtonXYZ(theForm) {
  GetRefWhite(theForm);
  GetRGBModel(theForm);
  GetGamma(theForm);
  GetAdaptation(theForm);
  GetXYZ(theForm);
  XYZ2xyY();
  XYZ2Lab();
  Lab2LCHab();
  XYZ2Luv();
  Luv2LCHuv();
  XYZ2RGB();
  XYZ2CCT();
  CalcDomWavelength();
  FillAllCells(theForm);
}

function ButtonxyY(theForm) {
  GetRefWhite(theForm);
  GetRGBModel(theForm);
  GetGamma(theForm);
  GetAdaptation(theForm);
  GetxyY(theForm);
  xyY2XYZ();
  XYZ2Lab();
  Lab2LCHab();
  XYZ2Luv();
  Luv2LCHuv();
  XYZ2RGB();
  XYZ2CCT();
  CalcDomWavelength();
  FillAllCells(theForm);
}

export function ButtonLab(theForm) {
  GetRefWhite(theForm);
  GetRGBModel(theForm);
  GetGamma(theForm);
  GetAdaptation(theForm);
  GetLab(theForm);
  Lab2XYZ();
  XYZ2xyY();
  Lab2LCHab();
  XYZ2Luv();
  Luv2LCHuv();
  XYZ2RGB();
  XYZ2CCT();
  CalcDomWavelength();
  FillAllCells(theForm);
}

function ButtonLCHab(theForm) {
  GetRefWhite(theForm);
  GetRGBModel(theForm);
  GetGamma(theForm);
  GetAdaptation(theForm);
  GetLCHab(theForm);
  LCHab2Lab();
  Lab2XYZ();
  XYZ2xyY();
  XYZ2Luv();
  Luv2LCHuv();
  XYZ2RGB();
  XYZ2CCT();
  CalcDomWavelength();
  FillAllCells(theForm);
}

function ButtonLuv(theForm) {
  GetRefWhite(theForm);
  GetRGBModel(theForm);
  GetGamma(theForm);
  GetAdaptation(theForm);
  GetLuv(theForm);
  Luv2XYZ();
  XYZ2xyY();
  Luv2LCHuv();
  XYZ2Lab();
  Lab2LCHab();
  XYZ2RGB();
  XYZ2CCT();
  CalcDomWavelength();
  FillAllCells(theForm);
}

function ButtonLCHuv(theForm) {
  GetRefWhite(theForm);
  GetRGBModel(theForm);
  GetGamma(theForm);
  GetAdaptation(theForm);
  GetLCHuv(theForm);
  LCHuv2Luv();
  Luv2XYZ();
  XYZ2xyY();
  XYZ2Lab();
  Lab2LCHab();
  XYZ2RGB();
  XYZ2CCT();
  CalcDomWavelength();
  FillAllCells(theForm);
}

function ButtonRGB(theForm) {
  GetRefWhite(theForm);
  GetRGBModel(theForm);
  GetGamma(theForm);
  GetAdaptation(theForm);
  GetRGB(theForm);
  RGB2XYZ();
  XYZ2xyY();
  XYZ2Lab();
  Lab2LCHab();
  XYZ2Luv();
  Luv2LCHuv();
  XYZ2CCT();
  CalcDomWavelength();
  FillAllCells(theForm);
}

function ButtonCCT(theForm) {
  GetRefWhite(theForm);
  GetRGBModel(theForm);
  GetGamma(theForm);
  GetAdaptation(theForm);
  GetCCT(theForm);
  CCT2XYZ();
  XYZ2xyY();
  XYZ2Lab();
  Lab2LCHab();
  XYZ2Luv();
  Luv2LCHuv();
  XYZ2RGB();
  CalcDomWavelength();
  FillAllCells(theForm);
}

function FillAllCells(theForm) {
  FillXYZCells(theForm);

  FillxyYCells(theForm);

  theForm.Lab_L = Lab.L.toFixed(4);
  theForm.Lab_a = Lab.a.toFixed(4);
  theForm.Lab_b = Lab.b.toFixed(4);

  theForm.LCHab_L = LCHab.L.toFixed(4);
  theForm.LCHab_C = LCHab.C.toFixed(4);
  theForm.LCHab_H = LCHab.H.toFixed(4);

  theForm.Luv_L = Luv.L.toFixed(4);
  theForm.Luv_u = Luv.u.toFixed(4);
  theForm.Luv_v = Luv.v.toFixed(4);

  theForm.LCHuv_L = LCHuv.L.toFixed(4);
  theForm.LCHuv_C = LCHuv.C.toFixed(4);
  theForm.LCHuv_H = LCHuv.H.toFixed(4);

  FillRGBCells(theForm);

  theForm.K = CCT >= 10000.0 / 6.0 && CCT <= 25000.0 ? CCT.toFixed(1) : '';
  theForm.DomWavelength = DomWavelengthNm != 0.0 ? DomWavelengthNm.toFixed(1) : 'N/A';
}

function FillXYZCells(theForm) {
  var scale = ScaleXYZ == false ? 1.0 : 100.0;
  var digits = ScaleXYZ == false ? 6 : 4;
  theForm.XYZ_X = (scale * XYZ.X).toFixed(digits);
  theForm.XYZ_Y = (scale * XYZ.Y).toFixed(digits);
  theForm.XYZ_Z = (scale * XYZ.Z).toFixed(digits);
}

function FillxyYCells(theForm) {
  var scale = ScaleY == false ? 1.0 : 100.0;
  var digits = ScaleY == false ? 6 : 4;
  theForm.xyY_x = xyY.x.toFixed(6);
  theForm.xyY_y = xyY.y.toFixed(6);
  theForm.xyY_Y = (scale * xyY.Y).toFixed(digits);
}

function FillRGBCells(theForm) {
  var scale = ScaleRGB == false ? 1.0 : 255.0;
  var digits = ScaleRGB == false ? 6 : 4;
  theForm.RGB_R = (scale * RGB.R).toFixed(digits);
  theForm.RGB_G = (scale * RGB.G).toFixed(digits);
  theForm.RGB_B = (scale * RGB.B).toFixed(digits);
}

function RGBModelChange(theForm) {
  GetRGBModel(theForm);
  theForm.Gamma.selectedIndex = GammaRGBIndex;
}

function GetXYZ(theForm) {
  var scale = ScaleXYZ == false ? 1.0 : 0.01;
  XYZ.X = scale * GetNumber(theForm.XYZ_X);
  XYZ.Y = scale * GetNumber(theForm.XYZ_Y);
  XYZ.Z = scale * GetNumber(theForm.XYZ_Z);

  XYZ.X = XYZ.X < 0.0 ? 0.0 : XYZ.X;
  XYZ.Y = XYZ.Y < 0.0 ? 0.0 : XYZ.Y;
  XYZ.Z = XYZ.Z < 0.0 ? 0.0 : XYZ.Z;
}

function GetxyY(theForm) {
  var scale = ScaleY == false ? 1.0 : 0.01;
  xyY.x = GetNumber(theForm.xyY_x);
  xyY.y = GetNumber(theForm.xyY_y);
  xyY.Y = scale * GetNumber(theForm.xyY_Y);

  xyY.Y = xyY.Y < 0.0 ? 0.0 : xyY.Y;
}

function GetLab(theForm) {
  Lab.L = GetNumber(theForm.Lab_L);
  Lab.a = GetNumber(theForm.Lab_a);
  Lab.b = GetNumber(theForm.Lab_b);

  Lab.L = Lab.L < 0.0 ? 0.0 : Lab.L > 100.0 ? 100.0 : Lab.L;
}

function GetLCHab(theForm) {
  LCHab.L = GetNumber(theForm.LCHab_L);
  LCHab.C = GetNumber(theForm.LCHab_C);
  LCHab.H = GetNumber(theForm.LCHab_H);

  LCHab.L = LCHab.L < 0.0 ? 0.0 : LCHab.L > 100.0 ? 100.0 : LCHab.L;
  LCHab.C = LCHab.C < 0.0 ? 0.0 : LCHab.C;
  while (LCHab.H < 0.0) {
    LCHab.H += 360.0;
  }
  while (LCHab.H >= 360.0) {
    LCHab.H -= 360.0;
  }
}

function GetLuv(theForm) {
  Luv.L = GetNumber(theForm.Luv_L);
  Luv.u = GetNumber(theForm.Luv_u);
  Luv.v = GetNumber(theForm.Luv_v);

  Luv.L = Luv.L < 0.0 ? 0.0 : Luv.L > 100.0 ? 100.0 : Luv.L;
}

function GetLCHuv(theForm) {
  LCHuv.L = GetNumber(theForm.LCHuv_L);
  LCHuv.C = GetNumber(theForm.LCHuv_C);
  LCHuv.H = GetNumber(theForm.LCHuv_H);

  LCHuv.L = LCHuv.L < 0.0 ? 0.0 : LCHuv.L > 100.0 ? 100.0 : LCHuv.L;
  LCHuv.C = LCHuv.C < 0.0 ? 0.0 : LCHuv.C;
  while (LCHuv.H < 0.0) {
    LCHuv.H += 360.0;
  }
  while (LCHuv.H >= 360.0) {
    LCHuv.H -= 360.0;
  }
}

function GetRGB(theForm) {
  var scale = ScaleRGB == false ? 1.0 : 1.0 / 255.0;
  RGB.R = scale * GetNumber(theForm.RGB_R);
  RGB.G = scale * GetNumber(theForm.RGB_G);
  RGB.B = scale * GetNumber(theForm.RGB_B);
}

function GetCCT(theForm) {
  CCT = GetNumber(theForm.K);
}

function GetRefWhite(theForm) {
  RefWhite.Y = 1.0;
  switch (theForm.RefWhite.selectedIndex) {
    case 0: // A (ASTM E308-01)
      RefWhite.X = 1.0985;
      RefWhite.Z = 0.35585;
      break;
    case 1: // B (Wyszecki & Stiles, p. 769)
      RefWhite.X = 0.99072;
      RefWhite.Z = 0.85223;
      break;
    case 2: // C (ASTM E308-01)
      RefWhite.X = 0.98074;
      RefWhite.Z = 1.18232;
      break;
    case 3: // D50 (ASTM E308-01)
      RefWhite.X = 0.96422;
      RefWhite.Z = 0.82521;
      break;
    case 4: // D55 (ASTM E308-01)
      RefWhite.X = 0.95682;
      RefWhite.Z = 0.92149;
      break;
    case 5: // D65 (ASTM E308-01)
      RefWhite.X = 0.95047;
      RefWhite.Z = 1.08883;
      break;
    case 6: // D75 (ASTM E308-01)
      RefWhite.X = 0.94972;
      RefWhite.Z = 1.22638;
      break;
    default:
    case 7: // E (ASTM E308-01)
      RefWhite.X = 1.0;
      RefWhite.Z = 1.0;
      break;
    case 8: // F2 (ASTM E308-01)
      RefWhite.X = 0.99186;
      RefWhite.Z = 0.67393;
      break;
    case 9: // F7 (ASTM E308-01)
      RefWhite.X = 0.95041;
      RefWhite.Z = 1.08747;
      break;
    case 10: // F11 (ASTM E308-01)
      RefWhite.X = 1.00962;
      RefWhite.Z = 0.6435;
      break;
  }
}

function GetRGBModel(theForm) {
  RefWhiteRGB.Y = 1.0;
  var xr, yr, xg, yg, xb, yb;

  switch (theForm.RGBModel.selectedIndex) {
    case 0 /* Adobe RGB (1998) */:
      xr = 0.64;
      yr = 0.33;
      xg = 0.21;
      yg = 0.71;
      xb = 0.15;
      yb = 0.06;

      RefWhiteRGB.X = 0.95047;
      RefWhiteRGB.Z = 1.08883;

      GammaRGB = 2.2;
      GammaRGBIndex = 2;
      break;
    case 1 /* AppleRGB */:
      xr = 0.625;
      yr = 0.34;
      xg = 0.28;
      yg = 0.595;
      xb = 0.155;
      yb = 0.07;

      RefWhiteRGB.X = 0.95047;
      RefWhiteRGB.Z = 1.08883;

      GammaRGB = 1.8;
      GammaRGBIndex = 1;
      break;
    case 2 /* Best RGB */:
      xr = 0.7347;
      yr = 0.2653;
      xg = 0.215;
      yg = 0.775;
      xb = 0.13;
      yb = 0.035;

      RefWhiteRGB.X = 0.96422;
      RefWhiteRGB.Z = 0.82521;

      GammaRGB = 2.2;
      GammaRGBIndex = 2;
      break;
    case 3 /* Beta RGB */:
      xr = 0.6888;
      yr = 0.3112;
      xg = 0.1986;
      yg = 0.7551;
      xb = 0.1265;
      yb = 0.0352;

      RefWhiteRGB.X = 0.96422;
      RefWhiteRGB.Z = 0.82521;

      GammaRGB = 2.2;
      GammaRGBIndex = 2;
      break;
    case 4 /* Bruce RGB */:
      xr = 0.64;
      yr = 0.33;
      xg = 0.28;
      yg = 0.65;
      xb = 0.15;
      yb = 0.06;

      RefWhiteRGB.X = 0.95047;
      RefWhiteRGB.Z = 1.08883;

      GammaRGB = 2.2;
      GammaRGBIndex = 2;
      break;
    case 5 /* CIE RGB */:
      xr = 0.735;
      yr = 0.265;
      xg = 0.274;
      yg = 0.717;
      xb = 0.167;
      yb = 0.009;

      RefWhiteRGB.X = 1.0;
      RefWhiteRGB.Z = 1.0;

      GammaRGB = 2.2;
      GammaRGBIndex = 2;
      break;
    case 6 /* ColorMatch RGB */:
      xr = 0.63;
      yr = 0.34;
      xg = 0.295;
      yg = 0.605;
      xb = 0.15;
      yb = 0.075;

      RefWhiteRGB.X = 0.96422;
      RefWhiteRGB.Z = 0.82521;

      GammaRGB = 1.8;
      GammaRGBIndex = 1;
      break;
    case 7 /* Don RGB 4 */:
      xr = 0.696;
      yr = 0.3;
      xg = 0.215;
      yg = 0.765;
      xb = 0.13;
      yb = 0.035;

      RefWhiteRGB.X = 0.96422;
      RefWhiteRGB.Z = 0.82521;

      GammaRGB = 2.2;
      GammaRGBIndex = 2;
      break;
    case 8 /* ECI RGB v2 */:
      xr = 0.67;
      yr = 0.33;
      xg = 0.21;
      yg = 0.71;
      xb = 0.14;
      yb = 0.08;

      RefWhiteRGB.X = 0.96422;
      RefWhiteRGB.Z = 0.82521;

      GammaRGB = 0.0;
      GammaRGBIndex = 4;
      break;
    case 9 /* Ekta Space PS5 */:
      xr = 0.695;
      yr = 0.305;
      xg = 0.26;
      yg = 0.7;
      xb = 0.11;
      yb = 0.005;

      RefWhiteRGB.X = 0.96422;
      RefWhiteRGB.Z = 0.82521;

      GammaRGB = 2.2;
      GammaRGBIndex = 2;
      break;
    case 10 /* NTSC RGB */:
      xr = 0.67;
      yr = 0.33;
      xg = 0.21;
      yg = 0.71;
      xb = 0.14;
      yb = 0.08;

      RefWhiteRGB.X = 0.98074;
      RefWhiteRGB.Z = 1.18232;

      GammaRGB = 2.2;
      GammaRGBIndex = 2;
      break;
    case 11 /* PAL/SECAM RGB */:
      xr = 0.64;
      yr = 0.33;
      xg = 0.29;
      yg = 0.6;
      xb = 0.15;
      yb = 0.06;

      RefWhiteRGB.X = 0.95047;
      RefWhiteRGB.Z = 1.08883;

      GammaRGB = 2.2;
      GammaRGBIndex = 2;
      break;
    case 12 /* ProPhoto RGB */:
      xr = 0.7347;
      yr = 0.2653;
      xg = 0.1596;
      yg = 0.8404;
      xb = 0.0366;
      yb = 0.0001;

      RefWhiteRGB.X = 0.96422;
      RefWhiteRGB.Z = 0.82521;

      GammaRGB = 1.8;
      GammaRGBIndex = 1;
      break;
    case 13 /* SMPTE-C RGB */:
      xr = 0.63;
      yr = 0.34;
      xg = 0.31;
      yg = 0.595;
      xb = 0.155;
      yb = 0.07;

      RefWhiteRGB.X = 0.95047;
      RefWhiteRGB.Z = 1.08883;

      GammaRGB = 2.2;
      GammaRGBIndex = 2;
      break;
    case 14 /* sRGB */:
      xr = 0.64;
      yr = 0.33;
      xg = 0.3;
      yg = 0.6;
      xb = 0.15;
      yb = 0.06;

      RefWhiteRGB.X = 0.95047;
      RefWhiteRGB.Z = 1.08883;

      GammaRGB = -2.2;
      GammaRGBIndex = 3;
      break;
    case 15 /* Wide Gamut RGB */:
      xr = 0.735;
      yr = 0.265;
      xg = 0.115;
      yg = 0.826;
      xb = 0.157;
      yb = 0.018;

      RefWhiteRGB.X = 0.96422;
      RefWhiteRGB.Z = 0.82521;

      GammaRGB = 2.2;
      GammaRGBIndex = 2;
      break;
  }

  var m = {
    m00: xr / yr,
    m01: xg / yg,
    m02: xb / yb,
    m10: 1.0,
    m11: 1.0,
    m12: 1.0,
    m20: (1.0 - xr - yr) / yr,
    m21: (1.0 - xg - yg) / yg,
    m22: (1.0 - xb - yb) / yb,
  };
  var mi = {
    m00: 1.0,
    m01: 0.0,
    m02: 0.0,
    m10: 0.0,
    m11: 1.0,
    m12: 0.0,
    m20: 0.0,
    m21: 0.0,
    m22: 1.0,
  };
  MtxInvert3x3(m, mi);

  var sr = RefWhiteRGB.X * mi.m00 + RefWhiteRGB.Y * mi.m01 + RefWhiteRGB.Z * mi.m02;
  var sg = RefWhiteRGB.X * mi.m10 + RefWhiteRGB.Y * mi.m11 + RefWhiteRGB.Z * mi.m12;
  var sb = RefWhiteRGB.X * mi.m20 + RefWhiteRGB.Y * mi.m21 + RefWhiteRGB.Z * mi.m22;

  MtxRGB2XYZ.m00 = sr * m.m00;
  MtxRGB2XYZ.m01 = sg * m.m01;
  MtxRGB2XYZ.m02 = sb * m.m02;
  MtxRGB2XYZ.m10 = sr * m.m10;
  MtxRGB2XYZ.m11 = sg * m.m11;
  MtxRGB2XYZ.m12 = sb * m.m12;
  MtxRGB2XYZ.m20 = sr * m.m20;
  MtxRGB2XYZ.m21 = sg * m.m21;
  MtxRGB2XYZ.m22 = sb * m.m22;

  MtxTranspose3x3(MtxRGB2XYZ);

  MtxInvert3x3(MtxRGB2XYZ, MtxXYZ2RGB);
}

function GetGamma(theForm) {
  switch (theForm.Gamma.selectedIndex) {
    case 0 /* 1.0 */:
      Gamma = 1.0;
      break;
    case 1 /* 1.8 */:
      Gamma = 1.8;
      break;
    case 2 /* 2.2 */:
      Gamma = 2.2;
      break;
    case 3 /* sRGB */:
      Gamma = -2.2;
      break;
    case 4 /* L* */:
      Gamma = 0.0;
      break;
  }
}

function GetAdaptation(theForm) {
  AdaptationMethod = theForm.Adaptation.selectedIndex;
  switch (AdaptationMethod) {
    case 0 /* Bradford */:
      MtxAdaptMa.m00 = 0.8951;
      MtxAdaptMa.m01 = -0.7502;
      MtxAdaptMa.m02 = 0.0389;
      MtxAdaptMa.m10 = 0.2664;
      MtxAdaptMa.m11 = 1.7135;
      MtxAdaptMa.m12 = -0.0685;
      MtxAdaptMa.m20 = -0.1614;
      MtxAdaptMa.m21 = 0.0367;
      MtxAdaptMa.m22 = 1.0296;

      MtxInvert3x3(MtxAdaptMa, MtxAdaptMaI);
      break;
    case 1 /* von Kries */:
      MtxAdaptMa.m00 = 0.40024;
      MtxAdaptMa.m01 = -0.2263;
      MtxAdaptMa.m02 = 0.0;
      MtxAdaptMa.m10 = 0.7076;
      MtxAdaptMa.m11 = 1.16532;
      MtxAdaptMa.m12 = 0.0;
      MtxAdaptMa.m20 = -0.08081;
      MtxAdaptMa.m21 = 0.0457;
      MtxAdaptMa.m22 = 0.91822;

      MtxInvert3x3(MtxAdaptMa, MtxAdaptMaI);
      break;
    case 2: /* XYZ Scaling */
    case 3 /* None */:
      MtxAdaptMa.m00 = 1.0;
      MtxAdaptMa.m01 = 0.0;
      MtxAdaptMa.m02 = 0.0;
      MtxAdaptMa.m10 = 0.0;
      MtxAdaptMa.m11 = 1.0;
      MtxAdaptMa.m12 = 0.0;
      MtxAdaptMa.m20 = 0.0;
      MtxAdaptMa.m21 = 0.0;
      MtxAdaptMa.m22 = 1.0;

      MtxAdaptMaI.m00 = 1.0;
      MtxAdaptMaI.m01 = 0.0;
      MtxAdaptMaI.m02 = 0.0;
      MtxAdaptMaI.m10 = 0.0;
      MtxAdaptMaI.m11 = 1.0;
      MtxAdaptMaI.m12 = 0.0;
      MtxAdaptMaI.m20 = 0.0;
      MtxAdaptMaI.m21 = 0.0;
      MtxAdaptMaI.m22 = 1.0;
      break;
  }
}

function XYZ2RGB() {
  var X2 = XYZ.X;
  var Y2 = XYZ.Y;
  var Z2 = XYZ.Z;

  if (AdaptationMethod != 3) {
    var As =
      RefWhite.X * MtxAdaptMa.m00 + RefWhite.Y * MtxAdaptMa.m10 + RefWhite.Z * MtxAdaptMa.m20;
    var Bs =
      RefWhite.X * MtxAdaptMa.m01 + RefWhite.Y * MtxAdaptMa.m11 + RefWhite.Z * MtxAdaptMa.m21;
    var Cs =
      RefWhite.X * MtxAdaptMa.m02 + RefWhite.Y * MtxAdaptMa.m12 + RefWhite.Z * MtxAdaptMa.m22;

    var Ad =
      RefWhiteRGB.X * MtxAdaptMa.m00 +
      RefWhiteRGB.Y * MtxAdaptMa.m10 +
      RefWhiteRGB.Z * MtxAdaptMa.m20;
    var Bd =
      RefWhiteRGB.X * MtxAdaptMa.m01 +
      RefWhiteRGB.Y * MtxAdaptMa.m11 +
      RefWhiteRGB.Z * MtxAdaptMa.m21;
    var Cd =
      RefWhiteRGB.X * MtxAdaptMa.m02 +
      RefWhiteRGB.Y * MtxAdaptMa.m12 +
      RefWhiteRGB.Z * MtxAdaptMa.m22;

    var X1 = XYZ.X * MtxAdaptMa.m00 + XYZ.Y * MtxAdaptMa.m10 + XYZ.Z * MtxAdaptMa.m20;
    var Y1 = XYZ.X * MtxAdaptMa.m01 + XYZ.Y * MtxAdaptMa.m11 + XYZ.Z * MtxAdaptMa.m21;
    var Z1 = XYZ.X * MtxAdaptMa.m02 + XYZ.Y * MtxAdaptMa.m12 + XYZ.Z * MtxAdaptMa.m22;

    X1 *= Ad / As;
    Y1 *= Bd / Bs;
    Z1 *= Cd / Cs;

    X2 = X1 * MtxAdaptMaI.m00 + Y1 * MtxAdaptMaI.m10 + Z1 * MtxAdaptMaI.m20;
    Y2 = X1 * MtxAdaptMaI.m01 + Y1 * MtxAdaptMaI.m11 + Z1 * MtxAdaptMaI.m21;
    Z2 = X1 * MtxAdaptMaI.m02 + Y1 * MtxAdaptMaI.m12 + Z1 * MtxAdaptMaI.m22;
  }

  RGB.R = Compand(X2 * MtxXYZ2RGB.m00 + Y2 * MtxXYZ2RGB.m10 + Z2 * MtxXYZ2RGB.m20);
  RGB.G = Compand(X2 * MtxXYZ2RGB.m01 + Y2 * MtxXYZ2RGB.m11 + Z2 * MtxXYZ2RGB.m21);
  RGB.B = Compand(X2 * MtxXYZ2RGB.m02 + Y2 * MtxXYZ2RGB.m12 + Z2 * MtxXYZ2RGB.m22);
}

function RGB2XYZ() {
  var R = InvCompand(RGB.R);
  var G = InvCompand(RGB.G);
  var B = InvCompand(RGB.B);

  XYZ.X = R * MtxRGB2XYZ.m00 + G * MtxRGB2XYZ.m10 + B * MtxRGB2XYZ.m20;
  XYZ.Y = R * MtxRGB2XYZ.m01 + G * MtxRGB2XYZ.m11 + B * MtxRGB2XYZ.m21;
  XYZ.Z = R * MtxRGB2XYZ.m02 + G * MtxRGB2XYZ.m12 + B * MtxRGB2XYZ.m22;

  if (AdaptationMethod != 3) {
    var Ad =
      RefWhite.X * MtxAdaptMa.m00 + RefWhite.Y * MtxAdaptMa.m10 + RefWhite.Z * MtxAdaptMa.m20;
    var Bd =
      RefWhite.X * MtxAdaptMa.m01 + RefWhite.Y * MtxAdaptMa.m11 + RefWhite.Z * MtxAdaptMa.m21;
    var Cd =
      RefWhite.X * MtxAdaptMa.m02 + RefWhite.Y * MtxAdaptMa.m12 + RefWhite.Z * MtxAdaptMa.m22;

    var As =
      RefWhiteRGB.X * MtxAdaptMa.m00 +
      RefWhiteRGB.Y * MtxAdaptMa.m10 +
      RefWhiteRGB.Z * MtxAdaptMa.m20;
    var Bs =
      RefWhiteRGB.X * MtxAdaptMa.m01 +
      RefWhiteRGB.Y * MtxAdaptMa.m11 +
      RefWhiteRGB.Z * MtxAdaptMa.m21;
    var Cs =
      RefWhiteRGB.X * MtxAdaptMa.m02 +
      RefWhiteRGB.Y * MtxAdaptMa.m12 +
      RefWhiteRGB.Z * MtxAdaptMa.m22;

    var X = XYZ.X * MtxAdaptMa.m00 + XYZ.Y * MtxAdaptMa.m10 + XYZ.Z * MtxAdaptMa.m20;
    var Y = XYZ.X * MtxAdaptMa.m01 + XYZ.Y * MtxAdaptMa.m11 + XYZ.Z * MtxAdaptMa.m21;
    var Z = XYZ.X * MtxAdaptMa.m02 + XYZ.Y * MtxAdaptMa.m12 + XYZ.Z * MtxAdaptMa.m22;

    X *= Ad / As;
    Y *= Bd / Bs;
    Z *= Cd / Cs;

    XYZ.X = X * MtxAdaptMaI.m00 + Y * MtxAdaptMaI.m10 + Z * MtxAdaptMaI.m20;
    XYZ.Y = X * MtxAdaptMaI.m01 + Y * MtxAdaptMaI.m11 + Z * MtxAdaptMaI.m21;
    XYZ.Z = X * MtxAdaptMaI.m02 + Y * MtxAdaptMaI.m12 + Z * MtxAdaptMaI.m22;
  }
}

function GetNumber(s) {
  var val = parseFloat(s);
  return isNaN(val) ? 0.0 : val;
}

function Compand(linear) {
  var companded;
  if (Gamma > 0.0) {
    companded = linear >= 0.0 ? Math.pow(linear, 1.0 / Gamma) : -Math.pow(-linear, 1.0 / Gamma);
  } else if (Gamma < 0.0) {
    /* sRGB */
    var sign = 1.0;
    if (linear < 0.0) {
      sign = -1.0;
      linear = -linear;
    }
    companded = linear <= 0.0031308 ? linear * 12.92 : 1.055 * Math.pow(linear, 1.0 / 2.4) - 0.055;
    companded *= sign;
  } else {
    /* L* */
    var sign = 1.0;
    if (linear < 0.0) {
      sign = -1.0;
      linear = -linear;
    }
    companded =
      linear <= 216.0 / 24389.0
        ? linear * 24389.0 / 2700.0
        : 1.16 * Math.pow(linear, 1.0 / 3.0) - 0.16;
    companded *= sign;
  }
  return companded;
}

function InvCompand(companded) {
  var linear;
  if (Gamma > 0.0) {
    linear = companded >= 0.0 ? Math.pow(companded, Gamma) : -Math.pow(-companded, Gamma);
  } else if (Gamma < 0.0) {
    /* sRGB */
    var sign = 1.0;
    if (companded < 0.0) {
      sign = -1.0;
      companded = -companded;
    }
    linear = companded <= 0.04045 ? companded / 12.92 : Math.pow((companded + 0.055) / 1.055, 2.4);
    linear *= sign;
  } else {
    /* L* */
    var sign = 1.0;
    if (companded < 0.0) {
      sign = -1.0;
      companded = -companded;
    }
    linear =
      companded <= 0.08
        ? 2700.0 * companded / 24389.0
        : (((1000000.0 * companded + 480000.0) * companded + 76800.0) * companded + 4096.0) /
          1560896.0;
    linear *= sign;
  }
  return linear;
}

function XYZ2xyY() {
  var Den = XYZ.X + XYZ.Y + XYZ.Z;
  /* TODO: divide by zero handling */
  if (Den > 0.0) {
    xyY.x = XYZ.X / Den;
    xyY.y = XYZ.Y / Den;
  } else {
    xyY.x = RefWhite.X / (RefWhite.X + RefWhite.Y + RefWhite.Z);
    xyY.y = RefWhite.Y / (RefWhite.X + RefWhite.Y + RefWhite.Z);
  }
  xyY.Y = XYZ.Y;
}

function XYZ2Lab() {
  var xr = XYZ.X / RefWhite.X;
  var yr = XYZ.Y / RefWhite.Y;
  var zr = XYZ.Z / RefWhite.Z;

  var fx = xr > kE ? Math.pow(xr, 1.0 / 3.0) : (kK * xr + 16.0) / 116.0;
  var fy = yr > kE ? Math.pow(yr, 1.0 / 3.0) : (kK * yr + 16.0) / 116.0;
  var fz = zr > kE ? Math.pow(zr, 1.0 / 3.0) : (kK * zr + 16.0) / 116.0;

  Lab.L = 116.0 * fy - 16.0;
  Lab.a = 500.0 * (fx - fy);
  Lab.b = 200.0 * (fy - fz);
}

function XYZ2Luv() {
  var Den = XYZ.X + 15.0 * XYZ.Y + 3.0 * XYZ.Z;
  var up = Den > 0.0 ? 4.0 * XYZ.X / (XYZ.X + 15.0 * XYZ.Y + 3.0 * XYZ.Z) : 0.0;
  var vp = Den > 0.0 ? 9.0 * XYZ.Y / (XYZ.X + 15.0 * XYZ.Y + 3.0 * XYZ.Z) : 0.0;

  var urp = 4.0 * RefWhite.X / (RefWhite.X + 15.0 * RefWhite.Y + 3.0 * RefWhite.Z);
  var vrp = 9.0 * RefWhite.Y / (RefWhite.X + 15.0 * RefWhite.Y + 3.0 * RefWhite.Z);

  var yr = XYZ.Y / RefWhite.Y;

  Luv.L = yr > kE ? 116.0 * Math.pow(yr, 1.0 / 3.0) - 16.0 : kK * yr;
  Luv.u = 13.0 * Luv.L * (up - urp);
  Luv.v = 13.0 * Luv.L * (vp - vrp);
}

function xyY2XYZ() {
  if (xyY.y < 0.000001) {
    XYZ.X = XYZ.Y = XYZ.Z = 0.0;
  } else {
    XYZ.X = xyY.x * xyY.Y / xyY.y;
    XYZ.Y = xyY.Y;
    XYZ.Z = (1.0 - xyY.x - xyY.y) * xyY.Y / xyY.y;
  }
}

function Lab2XYZ() {
  var fy = (Lab.L + 16.0) / 116.0;
  var fx = 0.002 * Lab.a + fy;
  var fz = fy - 0.005 * Lab.b;

  var fx3 = fx * fx * fx;
  var fz3 = fz * fz * fz;

  var xr = fx3 > kE ? fx3 : (116.0 * fx - 16.0) / kK;
  var yr = Lab.L > kKE ? Math.pow((Lab.L + 16.0) / 116.0, 3.0) : Lab.L / kK;
  var zr = fz3 > kE ? fz3 : (116.0 * fz - 16.0) / kK;

  XYZ.X = xr * RefWhite.X;
  XYZ.Y = yr * RefWhite.Y;
  XYZ.Z = zr * RefWhite.Z;
}

function Lab2LCHab() {
  LCHab.L = Lab.L;
  LCHab.C = Math.sqrt(Lab.a * Lab.a + Lab.b * Lab.b);
  LCHab.H = 180.0 * Math.atan2(Lab.b, Lab.a) / Math.PI;
  if (LCHab.H < 0.0) {
    LCHab.H += 360.0;
  }
}

function LCHab2Lab() {
  Lab.L = LCHab.L;
  Lab.a = LCHab.C * Math.cos(LCHab.H * Math.PI / 180.0);
  Lab.b = LCHab.C * Math.sin(LCHab.H * Math.PI / 180.0);
}

function Luv2XYZ() {
  XYZ.Y = Luv.L > kKE ? Math.pow((Luv.L + 16.0) / 116.0, 3.0) : Luv.L / kK;
  var u0 = 4.0 * RefWhite.X / (RefWhite.X + 15.0 * RefWhite.Y + 3.0 * RefWhite.Z);
  var v0 = 9.0 * RefWhite.Y / (RefWhite.X + 15.0 * RefWhite.Y + 3.0 * RefWhite.Z);

  var a = (52.0 * Luv.L / (Luv.u + 13.0 * Luv.L * u0) - 1.0) / 3.0;
  var b = -5.0 * XYZ.Y;
  var c = -1.0 / 3.0;
  var d = XYZ.Y * (39.0 * Luv.L / (Luv.v + 13.0 * Luv.L * v0) - 5.0);

  XYZ.X = (d - b) / (a - c);
  XYZ.Z = XYZ.X * a + b;
}

function Luv2LCHuv() {
  LCHuv.L = Luv.L;
  LCHuv.C = Math.sqrt(Luv.u * Luv.u + Luv.v * Luv.v);
  LCHuv.H = 180.0 * Math.atan2(Luv.v, Luv.u) / Math.PI;
  if (LCHuv.H < 0.0) {
    LCHuv.H += 360.0;
  }
}

function LCHuv2Luv() {
  Luv.L = LCHuv.L;
  Luv.u = LCHuv.C * Math.cos(LCHuv.H * Math.PI / 180.0);
  Luv.v = LCHuv.C * Math.sin(LCHuv.H * Math.PI / 180.0);
}

function CCT2XYZ() {
  var Temp = CCT;
  var C1 = 2.0 * Math.PI * 6.626176 * 2.99792458 * 2.99792458; // * 1.0e-18
  var C2 = 6.626176 * 2.99792458 / 1.380662; // * 1.0e-3
  var nm;
  var i = 0;
  XYZ.X = 0.0;
  XYZ.Y = 0.0;
  XYZ.Z = 0.0;

  for (nm = 360; nm <= 830; nm += 5) {
    var dWavelengthM = nm * 1.0e-3; // * 1.0e-6
    var dWavelengthM5 = dWavelengthM * dWavelengthM * dWavelengthM * dWavelengthM * dWavelengthM; // * 1.0e-30
    var blackbody =
      C1 / (dWavelengthM5 * 1.0e-12 * (Math.exp(C2 / (Temp * dWavelengthM * 1.0e-3)) - 1.0)); // -12 = -30 - (-18)
    XYZ.X += blackbody * CIE1931StdObs_x[i];
    XYZ.Y += blackbody * CIE1931StdObs_y[i];
    XYZ.Z += blackbody * CIE1931StdObs_z[i];
    i++;
  }
  XYZ.X /= XYZ.Y;
  XYZ.Z /= XYZ.Y;
  XYZ.Y = 1.0;
}

function CalcDomWavelength() {
  DomWavelengthNm = DominantWavelength(
    xyY.x,
    xyY.y,
    RefWhite.X / (RefWhite.X + RefWhite.Y + RefWhite.Z),
    RefWhite.Y / (RefWhite.X + RefWhite.Y + RefWhite.Z)
  );
}

function XYZ2CCT() {
  var rt = [
    /* reciprocal temperature (K) */
    0.0e-6,
    10.0e-6,
    20.0e-6,
    30.0e-6,
    40.0e-6,
    50.0e-6,
    60.0e-6,
    70.0e-6,
    80.0e-6,
    90.0e-6,
    100.0e-6,
    125.0e-6,
    150.0e-6,
    175.0e-6,
    200.0e-6,
    225.0e-6,
    250.0e-6,
    275.0e-6,
    300.0e-6,
    325.0e-6,
    350.0e-6,
    375.0e-6,
    400.0e-6,
    425.0e-6,
    450.0e-6,
    475.0e-6,
    500.0e-6,
    525.0e-6,
    550.0e-6,
    575.0e-6,
    600.0e-6,
  ];
  var u = [
    0.18006,
    0.18066,
    0.18133,
    0.18208,
    0.18293,
    0.18388,
    0.18494,
    0.18611,
    0.1874,
    0.1888,
    0.19032,
    0.19462,
    0.19962,
    0.20525,
    0.21142,
    0.21807,
    0.22511,
    0.23247,
    0.2401,
    0.24792,
    0.25591,
    0.264,
    0.27218,
    0.28039 /* 0.24792 is correct, W&S shows as 0.24702 which is a typo */,
    0.28863,
    0.29685,
    0.30505,
    0.3132,
    0.32129,
    0.32931,
    0.33724,
  ];
  var v = [
    0.26352,
    0.26589,
    0.26846,
    0.27119,
    0.27407,
    0.27709,
    0.28021,
    0.28342,
    0.28668,
    0.28997,
    0.29326,
    0.30141,
    0.30921,
    0.31647,
    0.32312,
    0.32909,
    0.33439,
    0.33904,
    0.34308,
    0.34655,
    0.34951,
    0.352,
    0.35407,
    0.35577,
    0.35714,
    0.35823,
    0.35907,
    0.35968,
    0.36011,
    0.36038,
    0.36051,
  ];
  var t = [
    -0.24341,
    -0.25479,
    -0.26876,
    -0.28539,
    -0.3047,
    -0.32675,
    -0.35156,
    -0.37915,
    -0.40955,
    -0.44278,
    -0.47888,
    -0.58204,
    -0.70471,
    -0.84901,
    -1.0182,
    -1.2168,
    -1.4512,
    -1.7298,
    -2.0637,
    -2.4681,
    -2.9641,
    -3.5814,
    -4.3633,
    -5.3762,
    -6.7262,
    -8.5955,
    -11.324,
    -15.628,
    -23.325,
    -40.77,
    -116.45,
  ];

  var us = 4.0 * XYZ.X / (XYZ.X + 15.0 * XYZ.Y + 3.0 * XYZ.Z);
  var vs = 6.0 * XYZ.Y / (XYZ.X + 15.0 * XYZ.Y + 3.0 * XYZ.Z);
  var prevVertDist = 0.0;
  var thisVertDist = 0.0;
  var i = 0;

  for (i = 0; i < 31; i++) {
    thisVertDist = vs - v[i] - t[i] * (us - u[i]);
    if (i == 0 && thisVertDist <= 0.0) {
      CCT = -10.0; /* cannot convert: color is too blue */
      return;
    }
    if (i > 0 && thisVertDist <= 0.0) break; /* found lines bounding (us, vs) : i-1 and i */
    prevVertDist = thisVertDist;
  }
  if (i == 31) {
    CCT = -10.0; /* cannot convert: color is too red */
  } else {
    var thisPerpDist = thisVertDist / Math.sqrt(1.0 + t[i] * t[i]);
    var prevPerpDist = prevVertDist / Math.sqrt(1.0 + t[i - 1] * t[i - 1]);
    var w =
      prevPerpDist / (prevPerpDist - thisPerpDist); /* w = lerping parameter, 0 : i-1, 1 : i */
    CCT = 1.0 / ((rt[i] - rt[i - 1]) * w + rt[i - 1]); /* 1.0 / (LERP(rt[i-1], rt[i], w)) */
  }
}

function XYZCheckBox(theForm) {
  ScaleXYZ = ScaleXYZ == true ? false : true;
  var scale = ScaleXYZ == false ? 0.01 : 1.0;
  XYZ.X = scale * GetNumber(theForm.XYZ_X);
  XYZ.Y = scale * GetNumber(theForm.XYZ_Y);
  XYZ.Z = scale * GetNumber(theForm.XYZ_Z);
  FillXYZCells(theForm);
}

function YCheckBox(theForm) {
  ScaleY = ScaleY == true ? false : true;
  var scale = ScaleY == false ? 0.01 : 1.0;
  xyY.Y = scale * GetNumber(theForm.xyY_Y);
  FillxyYCells(theForm);
}

export function RGBCheckBox(theForm) {
  
  ScaleRGB = ScaleRGB == true ? false : true;

  var scale = ScaleRGB == false ? 1.0 / 255.0 : 1.0;
  RGB.R = scale * GetNumber(theForm.RGB_R);
  RGB.G = scale * GetNumber(theForm.RGB_G);
  RGB.B = scale * GetNumber(theForm.RGB_B);
  scale = 255.0;
  var digits = 0;
  theForm.RGB_R = (scale * RGB.R).toFixed(0);
  theForm.RGB_G = (scale * RGB.G).toFixed(0);
  theForm.RGB_B = (scale * RGB.B).toFixed(0);

  function hex(x) {
    return ('0' + parseInt(x).toString(16)).slice(-2);
  }
  var _hex = '#' + hex(`${theForm.RGB_R}`) + hex(`${theForm.RGB_G}`) + hex(`${theForm.RGB_B}`);
  theForm.hex = _hex;
}

export function CalculationE(avgLab, Lab) {
  return Math.sqrt(
    (avgLab.l - Lab.l) * (avgLab.l - Lab.l) +
      (avgLab.a - Lab.a) * (avgLab.a - Lab.a) +
      (avgLab.b - Lab.b) * (avgLab.b - Lab.b)
  ).toFixed(4);
}
