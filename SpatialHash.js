function SpatialHash(range, bucketSize) {
    this.bucketSize = bucketSize || 100;
    this.range = range;
    this.itemCount = 0;
    var b = this.rangeBounds = getBounds(range);

    this._hStart = ~~(b.left / bucketSize);
    this._hEnd = ~~(b.right / bucketSize);
    this._vStart = ~~(b.top / bucketSize);
    this._vEnd = ~~(b.bottom / bucketSize);
    this._nId = -1e8;

    this.init();
}

module.exports = SpatialHash;

SpatialHash.prototype.init = function() {
    var z = { };
    var i = this._hStart;
    for (; i <= this._hEnd; i++) {
        var j = this._vStart,
            a = { };

        for (; j <= this._vEnd; j++)
            a[j] = [];
        z[i] = a;
    }
    this.hashes = z;
    this.itemCount = 0;
    this._nId = -1e8;
};

SpatialHash.prototype.insert = function(item) {
    if (!item.range) return;
    var b = getBounds(item.range),
        bucketSize = this.bucketSize;

    var hStart = Math.max(~~(b.left / bucketSize), this._hStart);
    var hEnd = Math.min(~~(b.right / bucketSize), this._hEnd);
    var vStart = Math.max(~~(b.top / bucketSize), this._vStart);
    var vEnd = Math.min(~~(b.bottom / bucketSize), this._vEnd);
    item.__b = {
        hStart: hStart,
        hEnd: hEnd,
        vStart: vStart,
        vEnd: vEnd,
        id: this._nId++
    };

    var i = hStart, j;
    for (; i <= hEnd; i++) {
        j = vStart;
        for (; j <= vEnd; j++)
            this.hashes[i][j].push(item);
    }

    if (this.itemCount++ >= 2e8)
        throw new Error("SpatialHash: To ensure pure integer stability it must not have more than 2E8 (200 million) objects");
    else if (this.itemCount > 1e8 - 1)
        this.itemCount = -1e8;
};

SpatialHash.prototype.remove = function(item) {
    if (!item.__b) return;

    var hStart = item.__b.hStart;
    var hEnd = item.__b.hEnd;
    var vStart = item.__b.vStart;
    var vEnd = item.__b.vEnd;

    var i = hStart, j, k;
    for (; i <= hEnd; i++) {
        j = vStart;
        for (; j <= vEnd; j++) {
            k = this.hashes[i][j].indexOf(item);
            if (k !== -1) this.hashes[i][j].splice(k, 1);
        }
    }
    if (!(delete item.__b)) item.__b = undefined;
    this.itemCount--;
};

SpatialHash.prototype.update = function(item) {
    this.remove(item);
    this.insert(item);
};

SpatialHash.prototype.__srch = function(range, selector, callback, returnOnFirst) {
    var b = getBounds(range),
        bucketSize = this.bucketSize;

    // range might be larger than the hash's size itself
    var hStart = Math.max(~~(b.left / bucketSize), this._hStart);
    var hEnd = Math.min(~~(b.right / bucketSize), this._hEnd);
    var vStart = Math.max(~~(b.top / bucketSize), this._vStart);
    var vEnd = Math.min(~~(b.bottom / bucketSize), this._vEnd);

    var i = hStart, j, k, l, m, o = [], p = [];
    for (; i <= hEnd; i++) {
        j = vStart;
        for (; j <= vEnd; j++) {
            k = this.hashes[i][j];
            l = k.length;
            m = 0;
            for (; m < l; m++)
                if (intersects(k[m].range, range) && p.indexOf(k[m].__b.id) === -1) {
                    p.push(k[m].__b.id);
                    if (selector) if (!selector(k[m])) continue;
                    if (callback) callback(k[m]);
                    if (returnOnFirst) return true;
                    o.push(k[m]);
                }
        }
    }
    if (returnOnFirst) return false;
    return o;
};

SpatialHash.prototype.any = function(range) {
    return this.__srch(range, null, null, true);
};

SpatialHash.prototype.query = function(range, selector) {
    return this.__srch(range, selector, null, false);
};

SpatialHash.prototype.find = function(range, callback) {
    return this.__srch(range, null, callback, false);
};

function intersects(a, b) {
    var xa = a.x - a.w, ya = a.y - a.h, wa = a.w * 2, ha = a.h * 2,
        xb = b.x - b.w, yb = b.y - b.h, wb = b.w * 2, hb = b.h * 2;

    return xa <= xb + wb
        && xa + wa >= xb
        && ya <= yb + hb
        && ya + ha >= yb;
}

function getBounds(a) {
    return {
        left: a.x - a.w,
        right: a.x + a.w,
        top: a.y - a.h,
        bottom: a.y + a.h
    };
}
