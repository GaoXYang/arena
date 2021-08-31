function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return document.querySelectorAll(selector);
}

function createSlider(container, duration, callback) {
  var firstItem = container.children[0]; 
  var width = container.clientWidth; 
  var count = container.children.length; 
  var curIndex = 0; 

  function setHeight() {
    container.style.height = container.children[curIndex].offsetHeight + 'px';
  }

  setHeight();

  function switchTo(index) {
    if (index < 0) {
      index = 0;
    }
    if (index > count - 1) {
      index = count - 1;
    }
    firstItem.style.transition = '400ms';
    firstItem.style.marginLeft = -index * width + 'px';
    curIndex = index;
    callback && callback(index);
    setHeight();
  }

  container.ontouchstart = function (e) {
    var startX = e.touches[0].clientX;
    var startY = e.touches[0].clientY;
    var startLeft = -curIndex * width; 
    firstItem.style.transition = 'none';
    stopAuto();
    container.ontouchmove = function (e) {
      var endX = e.touches[0].clientX;
      var endY = e.touches[0].clientY;
      var disX = endX - startX; 
      var disY = endY - startY; 
      var newML = startLeft + disX; 
      if (newML > 0) {
        newML = 0;
      }
      if (newML < -(count - 1) * width) {
        newML = -(count - 1) * width;
      }
      firstItem.style.marginLeft = newML + 'px';
      if (Math.abs(disX) < Math.abs(disY)) {
        return;
      }
      e.preventDefault(); 
    };

    container.ontouchend = function (e) {
      var endX = e.changedTouches[0].clientX;
      var disX = endX - startX; 
      if (Math.abs(disX) < 30) {
        switchTo(curIndex);
      } else if (disX > 0) {
        switchTo(curIndex - 1);
      } else {
        switchTo(curIndex + 1);
      }

      if (duration) {
        startAuto();
      }
    };
  };

  var timerId;
  function startAuto() {
    if (timerId) {
      return;
    }
    timerId = setInterval(function () {
      var newIndex = (curIndex + 1) % count;
      switchTo(newIndex);
    }, duration);
  }

  function stopAuto() {
    clearInterval(timerId);
    timerId = null;
  }
  if (duration) {
    startAuto();
  }

  return {
    switchTo: switchTo,
  };
}

// banner区域
(function () {
  var container = $('.banner .slider-container');
  var dots = $('.banner .dots');
  createSlider(container, 3000, function (index) {
    var active = $('.banner .dots .active');
    if (active) {
      active.className = '';
    }
    dots.children[index].className = 'active';
  });
})();

// 中部菜单区域

(function () {
  var expand = $('.menu .expand');
  var isExpand = false; 
  var spr = $('.menu .expand .spr');
  var txt = $('.menu .expand .txt');
  var menuList = $('.menu .menu-list');
  expand.onclick = function () {
    if (isExpand) {
      spr.classList.remove('spr_collapse');
      spr.classList.add('spr_expand');
      txt.innerHTML = '展开';
    } else {
      spr.classList.remove('spr_expand');
      spr.classList.add('spr_collapse');
      txt.innerHTML = '折叠';
    }
    menuList.classList.toggle('list-expand');
    isExpand = !isExpand;
  };
})();

// 通用的block-container逻辑
function createBlockContainer(container) {
  var sliderContainer = container.querySelector('.slider-container');
  var menus = container.querySelector('.block-menu');
  var slider = createSlider(sliderContainer, 0, function (index) {
    var active = menus.querySelector('.active');
    if (active) {
      active.classList.remove('active');
    }
    menus.children[index].classList.add('active');
  });

  for (let i = 0; i < menus.children.length; i++) {
    menus.children[i].onclick = function () {
      slider.switchTo(i);
    };
  }
}

// 新闻区域
(async function () {
  var resp = await fetch('./data/news.json').then(function (resp) {
    return resp.json();
  });
  var result = Object.entries(resp).map(function (item) {
    var type = item[0];
    var news = item[1];
    var html = news.map(function (item) {
      return `<div class="news-item ${type}">
      <a href="${item.link}">${item.title}</a>
      <span>${item.pubDate}</span>
    </div>`;
    });
    return `<div class="slider-item">
      ${html.join('')}
    </div>`;
  });

  $('.news-list .slider-container').innerHTML = result.join('');
  createBlockContainer($('.news-list'));
})();

// 英雄区域
(async function () {
  var resp = await fetch('./data/hero.json').then(function (resp) {
    return resp.json();
  });
  var sliderContainer = $('.hero-list .slider-container');

  function createHeroBlock(heroes) {
    var div = document.createElement('div');
    div.className = 'slider-item';
    var html = heroes
      .map(function (item) {
        return `<a>
          <img
            src="https://game.gtimg.cn/images/yxzj/img201606/heroimg/${item.ename}/${item.ename}.jpg"
          />
          <span>${item.cname}</span>
        </a>`;
      })
      .join('');
    div.innerHTML = html;
    sliderContainer.appendChild(div);
  }

  var hots = resp.filter(function (item) {
    return item.hot === 1;
  });
  createHeroBlock(hots);
  for (var i = 1; i <= 6; i++) {
    var heroes = resp.filter(function (item) {
      return item.hero_type === i || item.hero_type2 === i;
    });
    createHeroBlock(heroes);
  }

  createBlockContainer($('.hero-list'));
})();

// 视频
(async function () {
  var resp = await fetch('./data/video.json').then(function (resp) {
    return resp.json();
  });
  var sliderContainer = $('.video-list .slider-container');

  var result = Object.entries(resp).map(function (item) {
    var videos = item[1];
    var html = videos
      .map(function (item) {
        return `<a
          href="${item.link}"
        >
          <img
            src="${item.cover}"
          />
          <div class="title">
            ${item.title}  
          </div>
          <div class="aside">
            <div class="play">
              <span class="spr spr_videonum"></span>
              <span>${item.playNumber}</span>
            </div>
            <div class="time">${item.pubDate}</div>
          </div>
        </a>`;
      })
      .join('');
    return `<div class="slider-item">
    ${html}
    </div>`;
  });
  console.log(result);
  sliderContainer.innerHTML = result.join('');

  // 最后创建区域
  createBlockContainer($('.video-list'));
})();
