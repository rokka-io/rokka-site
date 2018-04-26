//=include ../liip-styleguide/dist/assets/toolkit/scripts/toolkit.js

window.addEventListener('DOMContentLoaded', function() {
  var navbar = document.querySelector('.navbar');
  new Toolkit.Navbar(navbar, { mode: 'default' });
});

window.addEventListener('load', function() {
  if (window.location.hash) {
    window.scrollBy(0,-70);
  }
}, false);


window.addEventListener('hashchange', function() {
  window.scrollBy(0,-70);
}, false);


// window.addEventListener('DOMContentLoaded', function() {
//   var el = document.querySelector('#section-multiplier');
//   new Toolkit.Multiplier(el, '/assets/images/clouds-hero.png');
// });




// var $, applyTransform, getTransform, makeTransformable;

// $ = jQuery;

// getTransform = function(from, to) {
//   var A, H, b, h, i, k, k_i, l, lhs, m, ref, rhs;
//   console.assert((from.length === (ref = to.length) && ref === 4));
//   A = [];
//   for (i = k = 0; k < 4; i = ++k) {
//     A.push([from[i].x, from[i].y, 1, 0, 0, 0, -from[i].x * to[i].x, -from[i].y * to[i].x]);
//     A.push([0, 0, 0, from[i].x, from[i].y, 1, -from[i].x * to[i].y, -from[i].y * to[i].y]);
//   }
//   b = [];
//   for (i = l = 0; l < 4; i = ++l) {
//     b.push(to[i].x);
//     b.push(to[i].y);
//   }
//   h = numeric.solve(A, b);
//   H = [[h[0], h[1], 0, h[2]], [h[3], h[4], 0, h[5]], [0, 0, 1, 0], [h[6], h[7], 0, 1]];
//   for (i = m = 0; m < 4; i = ++m) {
//     lhs = numeric.dot(H, [from[i].x, from[i].y, 0, 1]);
//     k_i = lhs[3];
//     rhs = numeric.dot(k_i, [to[i].x, to[i].y, 0, 1]);
//     console.assert(numeric.norm2(numeric.sub(lhs, rhs)) < 1e-9, "Not equal:", lhs, rhs);
//   }
//   return H;
// };

// applyTransform = function(element, originalPos, targetPos, callback) {
//   var H, from, i, j, p, to;
//   from = (function() {
//     var k, len, results;
//     results = [];
//     for (k = 0, len = originalPos.length; k < len; k++) {
//       p = originalPos[k];
//       results.push({
//         x: p[0] - originalPos[0][0],
//         y: p[1] - originalPos[0][1]
//       });
//     }
//     return results;
//   })();
//   to = (function() {
//     var k, len, results;
//     results = [];
//     for (k = 0, len = targetPos.length; k < len; k++) {
//       p = targetPos[k];
//       results.push({
//         x: p[0] - originalPos[0][0],
//         y: p[1] - originalPos[0][1]
//       });
//     }
//     return results;
//   })();
//   H = getTransform(from, to);
//   $(element).css({
//     'transform': "matrix3d(" + (((function() {
//       var k, results;
//       results = [];
//       for (i = k = 0; k < 4; i = ++k) {
//         results.push((function() {
//           var l, results1;
//           results1 = [];
//           for (j = l = 0; l < 4; j = ++l) {
//             results1.push(H[j][i].toFixed(20));
//           }
//           return results1;
//         })());
//       }
//       return results;
//     })()).join(',')) + ")",
//     'transform-origin': '50% 50%'
//   });
//   return typeof callback === "function" ? callback(element, H) : void 0;
// };

// makeTransformable = function(selector, callback) {
//   return $(selector).each(function(i, element) {
//     var controlPoints, originalPos, p, position;
//     $(element).css('transform', '');
//     controlPoints = (function() {
//       var k, len, ref, results;
//       ref = ['left top', 'left bottom', 'right top', 'right bottom'];
//       results = [];
//       for (k = 0, len = ref.length; k < len; k++) {
//         position = ref[k];
//         results.push($('<div>').css({
//           border: '4px solid rgba(255,255,255,0.2)',
//           borderRadius: '4px',
//           cursor: 'move',
//           position: 'absolute',
//           zIndex: 100000
//         }).appendTo('body').position({
//           at: position,
//           of: element,
//           collision: 'none'
//         }));
//       }
//       return results;
//     })();
//     originalPos = (function() {
//       var k, len, results;
//       results = [];
//       for (k = 0, len = controlPoints.length; k < len; k++) {
//         p = controlPoints[k];
//         results.push([p.offset().left, p.offset().top]);
//       }
//       return results;
//     })();
//     $(controlPoints).draggable({
//       start: (function(_this) {
//         return function() {
//           return $(element).css('pointer-events', 'none');
//         };
//       })(this),
//       drag: (function(_this) {
//         return function() {
//           return applyTransform(element, originalPos, (function() {
//             var k, len, results;
//             results = [];
//             for (k = 0, len = controlPoints.length; k < len; k++) {
//               p = controlPoints[k];
//               results.push([p.offset().left, p.offset().top]);
//             }
//             return results;
//           })(), callback);
//         };
//       })(this),
//       stop: (function(_this) {
//         return function() {
//           applyTransform(element, originalPos, (function() {
//             var k, len, results;
//             results = [];
//             for (k = 0, len = controlPoints.length; k < len; k++) {
//               p = controlPoints[k];
//               results.push([p.offset().left, p.offset().top]);
//             }
//             return results;
//           })(), callback);
//           return $(element).css('pointer-events', 'auto');
//         };
//       })(this)
//     });
//     return element;
//   });
// };


// window.addEventListener('DOMContentLoaded', function() {
//   window.setTimeout(function() {
//       makeTransformable('.rokka-uoso-device--macbooks .rokka-uoso-device__screen', function(element, H) {
//       var i, j;
//       console.log($(element).css('transform'));
//       // return $(element).html($('<table>').append($('<tr>').html($('<td>').text('matrix3d('))).append((function() {
//       //   var k, results;
//       //   results = [];
//       //   for (i = k = 0; k < 4; i = ++k) {
//       //     results.push($('<tr>').append((function() {
//       //       var l, results1;
//       //       results1 = [];
//       //       for (j = l = 0; l < 4; j = ++l) {
//       //         results1.push($('<td>').text(H[j][i] + ((i === j && j === 3) ? '' : ',')));
//       //       }
//       //       return results1;
//       //     })()));
//       //   }
//       //   return results;
//       // })()).append($('<tr>').html($('<td>').text(')'))));
//     });
//   }, 1200);
// });



// ---
// generated by coffee-script 1.9.2