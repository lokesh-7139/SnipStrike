const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      maxlength: [30, 'Name must have less than or equal to 30 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      maxlength: 24,
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ['user', 'admin'],
        message: 'Role must be one of: user, admin',
      },
      default: 'user',
    },
    photo: {
      type: String,
      enum: [
        'avatar1.png',
        'avatar2.png',
        'avatar3.png',
        'avatar4.png',
        'avatar5.png',
        'avatar6.png',
        'avatar7.png',
        'avatar8.png',
      ],
      default: 'avatar1.png',
    },
    passwordChangedAt: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationCode: {
      type: Number,
    },
    emailVerificationExpiry: {
      type: Date,
    },
    emailCodeResendAttempts: {
      type: Number,
      default: 0,
    },
    codeforcesHandle: {
      type: String,
      required: [true, 'Please provide your codeforces handle'],
      unique: true,
      trim: true,
    },
    isCFVerified: {
      type: Boolean,
      default: false,
    },
    cfVerificationString: {
      type: String,
    },
    cfVerificationExpiry: {
      type: Date,
    },
    cfStringRegenerateAttempts: {
      type: Number,
      default: 0,
    },
    matchesPlayed: {
      type: Number,
      default: 0,
    },
    matchesWon: {
      type: Number,
      default: 0,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    maxStreak: {
      type: Number,
      default: 0,
    },
    points: {
      type: Number,
      default: 1000,
    },
    rank: {
      type: String,
      // add enum after deciding what ranks to use and add structure like rank color.
    },
    badges: [
      {
        badge: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Badge',
        },
        awardedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
      select: false,
      index: true,
    },
  },
  { timestamps: true }
);

userSchema.virtual('passwordConfirm').set(function (val) {
  this._passwordConfirm = val;
});

userSchema.pre('save', function (next) {
  if (this.isModified('password') && this.password !== this._passwordConfirm) {
    this.invalidate('passwordConfirm', 'Passwords do not match');
  }
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  if (!this.getOptions().includeInactiveUsers) {
    this.find({
      active: {
        $ne: false,
      },
    });
  }
  next();
});

userSchema.methods.checkPassword = async function (
  passwordEntered,
  passwordCurrent
) {
  return await bcrypt.compare(passwordEntered, passwordCurrent);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
