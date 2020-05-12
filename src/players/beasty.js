var a = [
  'c2hvb3Q=',
  'Y2FuS2lsbA==',
  'aW5zdGFuY2U=',
  'bWF4',
  'dnVsbmVyYWJpbGl0eUxldmVs',
  'ZWFzdA==',
  'ZGlyZWN0aW9u',
  'bmVhcmVzdEFtbW8=',
  'Z3JpZFNpemU=',
  'aW5kZXhPZg==',
  'YXN0ZXJvaWRz',
  'YWJz',
  'aXNBbGl2ZQ==',
  'ZmFzdEdldERpcmVjdGlvbg==',
  'cmFuZG9t',
  'Y2FuTW92ZQ==',
  'dmVydGljYWw=',
  'ZGlzdGFuY2U=',
  'YmVhc3R5',
  'Zmxvb3I=',
  'Zm9yRWFjaA==',
  'c291dGg=',
  'aG9yaXpvbnRhbA==',
  'Z2V0RGlzdGFuY2U=',
  'YW1tbw==',
  'ZGlzdGFuY2VMZWZ0',
  'bmVhcmVzdEFtbW9EaXN0YW5jZQ==',
  'bm9ydGg=',
  'bGVuZ3Ro',
  'bW92ZQ==',
  'c29tZQ==',
  'cG9zaXRpb24=',
  'd2VzdA==',
  'bWlu',
  'aXNWaXNpYmxl',
  'dnVsbmVyYWJpbGl0eQ==',
  'bmVhcmVzdEVuZW15',
  'ZGV0b25hdGVJbg=='
]
;(function(b, e) {
  var f = function(g) {
    while (--g) {
      b['push'](b['shift']())
    }
  }
  f(++e)
})(a, 0xb3)
var b = function(c, d) {
  c = c - 0x0
  var e = a[c]
  if (b['Rmgjvr'] === undefined) {
    (function() {
      var g = function() {
        var j
        try {
          j = Function(
            'return\x20(function()\x20' + '{}.constructor(\x22return\x20this\x22)(\x20)' + ');'
          )()
        } catch (k) {
          j = window
        }
        return j
      }
      var h = g()
      var i = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
      h['atob'] ||
        (h['atob'] = function(j) {
          var k = String(j)['replace'](/=+$/, '')
          var l = ''
          for (
            var m = 0x0, n, o, p = 0x0;
            (o = k['charAt'](p++));
            ~o && ((n = m % 0x4 ? n * 0x40 + o : o), m++ % 0x4)
              ? (l += String['fromCharCode'](0xff & (n >> ((-0x2 * m) & 0x6))))
              : 0x0
          ) {
            o = i['indexOf'](o)
          }
          return l
        })
    })()
    b['KEDjXk'] = function(g) {
      var h = atob(g)
      var j = []
      for (var k = 0x0, l = h['length']; k < l; k++) {
        j += '%' + ('00' + h['charCodeAt'](k)['toString'](0x10))['slice'](-0x2)
      }
      return decodeURIComponent(j)
    }
    b['HSZogl'] = {}
    b['Rmgjvr'] = !![]
  }
  var f = b['HSZogl'][c]
  if (f === undefined) {
    e = b['KEDjXk'](e)
    b['HSZogl'][c] = e
  } else {
    e = f
  }
  return e
}
var DIRECTIONS = [b('0x0'), 'east', b('0x20'), b('0x5')]
var movements = [b('0x0'), b('0x10'), b('0x20'), b('0x5'), b('0xb')]
var randomMove = () => {
  return Math[b('0x19')]() > 0.33
    ? b('0x2')
    : movements[Math['floor'](Math[b('0x19')]() * movements['length'])]
}
var safeRandomMove = () => {
  return Math[b('0x19')]() > 0.33
    ? b('0x2')
    : DIRECTIONS[Math[b('0x1e')](Math[b('0x19')]() * DIRECTIONS[b('0x1')])]
}
var turn = (c = [], d) => {
  var e = DIRECTIONS[b('0x14')](c)
  return DIRECTIONS[(e + d) % 0x4]
}
var getDirection = (c = [], d = []) => {
  c = c || []
  d = d || []
  var e = Math[b('0x16')](c[0x0] - d[0x0])
  var f = Math[b('0x16')](c[0x1] - d[0x1])
  if (e > f) {
    return c[0x0] - d[0x0] > 0x0 ? b('0x0') : b('0x20')
  }
  return c[0x1] - d[0x1] > 0x0 ? b('0x5') : b('0x10')
}
var getDistance = (c = [], d = []) => {
  var e = Math[b('0x16')](c[0x0] - d[0x0])
  var f = Math[b('0x16')](c[0x1] - d[0x1])
  return f + e
}
var fastGetDirection = (c = [], d = []) => {
  var e = Math[b('0x16')](c[0x0] - d[0x0])
  if (e) {
    return c[0x0] - d[0x0] > 0x0 ? b('0x0') : b('0x20')
  }
  return c[0x1] - d[0x1] > 0x0 ? b('0x5') : b('0x10')
}
var isVisible = (c = [], d = [], e = []) => {
  switch (e) {
    case DIRECTIONS[0x0]:
      return c[0x1] === d[0x1] && c[0x0] > d[0x0]
    case DIRECTIONS[0x1]:
      return c[0x0] === d[0x0] && c[0x1] < d[0x1]
    case DIRECTIONS[0x2]:
      return c[0x1] === d[0x1] && c[0x0] < d[0x0]
    case DIRECTIONS[0x3]:
      return c[0x0] === d[0x0] && c[0x1] > d[0x1]
    default:
      break
  }
}
var canKill = (c = {}, d = []) => {
  return d[b('0x3')](e => {
    return e[b('0x17')] && isVisible(c[b('0x4')], e[b('0x4')], c[b('0x11')])
  })
}
var isOnAsteroid = (c, d) => {
  const [e, f] = c
  return d[b('0x3')](g => g['position'][0x0] === e && g[b('0x4')][0x1] === f)
}
var inDangerOfAsteroid = (c, d) => {
  const [e, f] = c
  return d[b('0x3')](g => g[b('0xa')] < 0x2 && g['position'][0x0] === e && g[b('0x4')][0x1] === f)
}
const utils = {
  randomMove: randomMove,
  getDirection: getDirection,
  isVisible: isVisible,
  canKill: canKill,
  safeRandomMove: safeRandomMove,
  fastGetDirection: fastGetDirection,
  turn: turn,
  getDistance: getDistance,
  isOnAsteroid: isOnAsteroid
}
var ORIENTATION = {
  north: b('0x1b'),
  east: 'horizontal',
  south: b('0x1b'),
  west: b('0x21')
}
export default {
  info: { name: b('0x1d'), style: 0x3 },
  ai: function(c, d, e) {
    var f
    var g = []
    var h = {
      vulnerabilityLevel: null,
      canKill: null,
      nearestAmmo: null,
      nearestEnemy: null,
      canMove: null
    }
    if (utils['isOnAsteroid'](c[b('0x4')], e[b('0x15')])) {
      return b('0x2')
    }
    d[b('0x1f')](function(w) {
      if (w[b('0x17')] === !![]) {
        w[b('0x25')] = l(w[b('0x4')])
        g['push'](w)
      }
    })
    h[b('0xf')] = i(c[b('0x4')])
    h[b('0xc')] = c[b('0x23')] > 0x0 && utils[b('0xc')](c, d)
    h[b('0x12')] = k(c[b('0x4')])
    h['nearestEnemy'] = m(c[b('0x4')])
    h[b('0x1a')] = q(c[b('0x4')], c['direction'])
    function i(w) {
      var x = 0x0
      g['forEach'](function(A) {
        if (utils[b('0x7')](A[b('0x4')], w, A['direction']) && A[b('0x23')] > 0x0) {
          x = Math['max'](x, 0x1)
        } else if (
          j(A['position'], w) &&
          (A[b('0x23')] > 0x0 || A['nearestAmmoDistance'] === 0x1)
        ) {
          x = Math[b('0xe')](x, 0.5)
        }
      })
      if (x === 0x0) {
        var y = [w[0x0] + 0x1, w[0x1] + 0x1]
        var z = [w[0x0] - 0x1, w[0x1] - 0x1]
        g['forEach'](function(A) {
          if (A[b('0x23')] > 0x0) {
            if (j(A[b('0x4')], y) || j(A[b('0x4')], z)) {
              x = Math[b('0xe')](x, 0.25)
            }
          }
        })
      }
      return x
    }
    function j(w, x) {
      var y = ![]
      y = y || (w[0x1] === x[0x1] && w[0x0] > x[0x0])
      y = y || (w[0x0] === x[0x0] && w[0x1] < x[0x1])
      y = y || (w[0x1] === x[0x1] && w[0x0] < x[0x0])
      y = y || (w[0x0] === x[0x0] && w[0x1] > x[0x1])
      return y
    }
    function k(w) {
      var x = null
      var y = null
      e['ammoPosition'][b('0x1f')](function(z) {
        var A = utils[b('0x22')](w, z)
        if (y === null || A < y) {
          y = A
          x = { position: z, distance: y }
        }
      })
      return x
    }
    function l(w) {
      var x = null
      e['ammoPosition'][b('0x1f')](function(y) {
        var z = utils[b('0x22')](w, y)
        if (x === null || z < x) {
          x = z
        }
      })
      return x
    }
    function m(w) {
      var x = null
      var y = null
      g[b('0x1f')](function(z) {
        var A = n(w, z)
        if (y === null || A < y) {
          y = A
          x = { instance: z, distance: y }
        }
      })
      return x
    }
    function n(w, x) {
      var y = Math['abs'](w[0x0] - x['position'][0x0])
      var z = Math['abs'](w[0x1] - x[b('0x4')][0x1])
      return Math[b('0x6')](z, y)
    }
    function o() {
      if (h[b('0xf')] === 0x1) {
        var w = h[b('0x1a')]
        var x
        g[b('0x1f')](function(y) {
          if (y[b('0x23')] > 0x0 && utils['isVisible'](y[b('0x4')], c[b('0x4')], y['direction'])) {
            x = y
          }
        })
        if (x && ORIENTATION[x[b('0x11')]] === ORIENTATION[c['direction']]) {
          w = ![]
        }
        if (w) {
          return b('0x2')
        } else if (x && c[b('0x23')] > 0x0) {
          return t(x)
        } else {
          return p()
        }
      } else {
        return p()
      }
    }
    function p() {
      var w = c[b('0x11')]
      var x = h['vulnerabilityLevel']
      var y = 0x0
      var z = [
        {
          direction: b('0x0'),
          position: [c[b('0x4')][0x0] - 0x1, c[b('0x4')][0x1]]
        },
        {
          direction: b('0x10'),
          position: [c[b('0x4')][0x0], c[b('0x4')][0x1] + 0x1]
        },
        {
          direction: b('0x20'),
          position: [c['position'][0x0] + 0x1, c[b('0x4')][0x1]]
        },
        {
          direction: b('0x5'),
          position: [c[b('0x4')][0x0], c[b('0x4')][0x1] - 0x1]
        }
      ]
      z[b('0x1f')](function(B) {
        B[b('0x8')] = i(B[b('0x4')])
        B[b('0x24')] = A(B[b('0x11')])
        B[b('0x1a')] = q(c[b('0x4')], B[b('0x11')])
        var C = B['vulnerability'] < x || (B[b('0x8')] === x && B['distanceLeft'] > y)
        if (B[b('0x1a')] && C) {
          w = B[b('0x11')]
          x = B['vulnerability']
          y = B[b('0x24')]
        }
      })
      if (w === c[b('0x11')]) {
        return u()
      } else {
        return w
      }
      function A(B) {
        if (B === b('0x0')) {
          return c[b('0x4')][0x0]
        } else if (B === b('0x10')) {
          return e[b('0x13')] - c[b('0x4')][0x1]
        } else if (B === b('0x20')) {
          return e[b('0x13')] - c[b('0x4')][0x0]
        } else if (B === b('0x5')) {
          return c[b('0x4')][0x1]
        }
      }
    }
    function q(w, x) {
      if (x === b('0x0')) {
        return w[0x0] > 0x0
      } else if (x === b('0x10')) {
        return w[0x1] < e[b('0x13')]
      } else if (x === b('0x20')) {
        return w[0x0] < e[b('0x13')]
      } else if (x === 'west') {
        return w[0x1] > 0x0
      }
    }
    function r() {
      return b('0xb')
    }
    function s() {
      if (c[b('0x23')] === 0x0 && h[b('0x12')]) {
        return v(h[b('0x12')]['position'])
      } else if (c['ammo'] > 0x0 && h[b('0x9')]) {
        if (h[b('0x12')] && h[b('0x12')][b('0x1c')] < h[b('0x9')][b('0x1c')]) {
          return v(h[b('0x12')]['position'])
        } else {
          return t(h[b('0x9')][b('0xd')])
        }
      } else {
        return p()
      }
    }
    function t(w) {
      if (utils['isVisible'](c[b('0x4')], w[b('0x4')], c[b('0x11')])) {
        return r()
      } else {
        var x = z()
        var y = n(c[b('0x4')], w)
        if (x === c[b('0x11')] && (y > 0x1 || w[b('0x23')] === 0x0)) {
          return b('0x2')
        } else {
          return x
        }
      }
      function z() {
        var A = j(c[b('0x4')], w[b('0x4')])
        var B = ORIENTATION[w[b('0x11')]]
        if (A) {
          return utils[b('0x18')](c[b('0x4')], w[b('0x4')])
        } else {
          if (B === b('0x1b')) {
            return w[b('0x4')][0x1] > c[b('0x4')][0x1] ? b('0x10') : b('0x5')
          } else {
            return w[b('0x4')][0x0] > c[b('0x4')][0x0] ? b('0x20') : 'north'
          }
        }
      }
    }
    function u() {
      var w
      var x
      if (c[b('0x11')] === 'north') {
        w = [c[b('0x4')][0x0] - 0x1, c[b('0x4')][0x1]]
      } else if (c[b('0x11')] === b('0x10')) {
        w = [c['position'][0x0], c[b('0x4')][0x1] + 0x1]
      } else if (c[b('0x11')] === b('0x20')) {
        w = [c[b('0x4')][0x0] + 0x1, c[b('0x4')][0x1]]
      } else if (c['direction'] === b('0x5')) {
        w = [c[b('0x4')][0x0], c[b('0x4')][0x1] - 0x1]
      }
      x = i(w)
      if (x === 0x1) {
        return null
      } else {
        return b('0x2')
      }
    }
    function v(w) {
      var x = utils[b('0x18')](c[b('0x4')], w)
      if (x === c[b('0x11')]) {
        return u()
      } else {
        return x
      }
    }
    if (
      h['vulnerabilityLevel'] === 0x1 ||
      (h['vulnerabilityLevel'] >= 0.5 && h[b('0xc')] !== !![])
    ) {
      f = o()
    } else if (h[b('0xc')] === !![]) {
      f = r()
    } else {
      f = s()
    }
    return f
  }
}
