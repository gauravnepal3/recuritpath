
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  detectRuntime,
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.10.2
 * Query Engine version: 5a9203d0590c951969e85a7d07215503f4672eb9
 */
Prisma.prismaVersion = {
  client: "5.10.2",
  engine: "5a9203d0590c951969e85a7d07215503f4672eb9"
}

Prisma.PrismaClientKnownRequestError = () => {
  throw new Error(`PrismaClientKnownRequestError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  throw new Error(`PrismaClientUnknownRequestError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  throw new Error(`PrismaClientRustPanicError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  throw new Error(`PrismaClientInitializationError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  throw new Error(`PrismaClientValidationError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  throw new Error(`NotFoundError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  throw new Error(`sqltag is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  throw new Error(`empty is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  throw new Error(`join is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  throw new Error(`raw is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  throw new Error(`Extensions.getExtensionContext is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  throw new Error(`Extensions.defineExtension is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}

/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.OrganizationUserRoleScalarFieldEnum = {
  id: 'id',
  role: 'role',
  organizationId: 'organizationId',
  email: 'email',
  userId: 'userId',
  status: 'status',
  createdAt: 'createdAt'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  emailVerified: 'emailVerified',
  image: 'image',
  password: 'password',
  role: 'role',
  isTwoFactorEnabled: 'isTwoFactorEnabled'
};

exports.Prisma.AccountScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  provider: 'provider',
  providerAccountId: 'providerAccountId',
  refresh_token: 'refresh_token',
  access_token: 'access_token',
  expires_at: 'expires_at',
  token_type: 'token_type',
  scope: 'scope',
  id_token: 'id_token',
  session_state: 'session_state'
};

exports.Prisma.VerificationTokenScalarFieldEnum = {
  id: 'id',
  email: 'email',
  token: 'token',
  expires: 'expires'
};

exports.Prisma.PasswordResetTokenScalarFieldEnum = {
  id: 'id',
  email: 'email',
  token: 'token',
  expires: 'expires'
};

exports.Prisma.TwoFactorTokenScalarFieldEnum = {
  id: 'id',
  email: 'email',
  token: 'token',
  expires: 'expires'
};

exports.Prisma.TwoFactorConfirmationScalarFieldEnum = {
  id: 'id',
  userId: 'userId'
};

exports.Prisma.OrganizationScalarFieldEnum = {
  id: 'id',
  name: 'name',
  url: 'url',
  logo: 'logo',
  assignedDomain: 'assignedDomain',
  customDomain: 'customDomain',
  createdAt: 'createdAt'
};

exports.Prisma.OrganizationSubscriptionScalarFieldEnum = {
  id: 'id',
  referalId: 'referalId',
  paymentHandler: 'paymentHandler',
  organizationId: 'organizationId',
  status: 'status',
  subscriptionType: 'subscriptionType',
  userId: 'userId',
  createdAt: 'createdAt',
  expiresOn: 'expiresOn'
};

exports.Prisma.PaymentScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  paddlePaymentId: 'paddlePaymentId',
  amount: 'amount',
  currency: 'currency',
  status: 'status',
  createdAt: 'createdAt'
};

exports.Prisma.OrganizationActivityLogScalarFieldEnum = {
  id: 'id',
  action: 'action',
  organizationId: 'organizationId',
  createdAt: 'createdAt'
};

exports.Prisma.JobPostScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  category: 'category',
  employmentType: 'employmentType',
  country: 'country',
  city: 'city',
  remoteOption: 'remoteOption',
  countryResidence: 'countryResidence',
  countryListResidence: 'countryListResidence',
  displaySalary: 'displaySalary',
  currency: 'currency',
  salaryAmount: 'salaryAmount',
  minimumAmount: 'minimumAmount',
  maximumAmount: 'maximumAmount',
  isPublished: 'isPublished',
  isScheduled: 'isScheduled',
  isArchived: 'isArchived',
  dateStart: 'dateStart',
  dateEnd: 'dateEnd',
  organizationId: 'organizationId',
  createdAt: 'createdAt'
};

exports.Prisma.JobApplicationScalarFieldEnum = {
  id: 'id',
  label: 'label',
  dataType: 'dataType',
  option: 'option',
  rule: 'rule',
  questionType: 'questionType',
  isDeleted: 'isDeleted',
  jobId: 'jobId',
  createdAt: 'createdAt'
};

exports.Prisma.CandidateApplicationScalarFieldEnum = {
  id: 'id',
  jobId: 'jobId',
  createdAt: 'createdAt',
  stageId: 'stageId'
};

exports.Prisma.CandidateReviewScalarFieldEnum = {
  id: 'id',
  description: 'description',
  verdict: 'verdict',
  createdAt: 'createdAt'
};

exports.Prisma.CandidateTimelineScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  userId: 'userId',
  actionType: 'actionType',
  jobId: 'jobId',
  timelineText: 'timelineText',
  comment: 'comment',
  reviewId: 'reviewId',
  candidateId: 'candidateId'
};

exports.Prisma.FormResponseScalarFieldEnum = {
  id: 'id',
  candidateApplicationId: 'candidateApplicationId',
  jobApplicationId: 'jobApplicationId',
  label: 'label',
  value: 'value',
  createdAt: 'createdAt'
};

exports.Prisma.JobPreviewScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  expiresAt: 'expiresAt',
  isExpired: 'isExpired',
  organizationId: 'organizationId',
  jobId: 'jobId'
};

exports.Prisma.JobStageScalarFieldEnum = {
  id: 'id',
  name: 'name',
  isDeletable: 'isDeletable',
  isDeleted: 'isDeleted',
  displayOrder: 'displayOrder',
  jobId: 'jobId',
  createdAt: 'createdAt'
};

exports.Prisma.JobMailingTemplateScalarFieldEnum = {
  id: 'id',
  name: 'name',
  subject: 'subject',
  body: 'body',
  createdAt: 'createdAt',
  jobId: 'jobId'
};

exports.Prisma.EmailMessageScalarFieldEnum = {
  id: 'id',
  messageId: 'messageId',
  parentMessageId: 'parentMessageId',
  sender: 'sender',
  recipient: 'recipient',
  subject: 'subject',
  body: 'body',
  s3Url: 's3Url',
  direction: 'direction',
  createdAt: 'createdAt',
  userId: 'userId',
  candidateId: 'candidateId'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  message: 'message',
  createdAt: 'createdAt',
  type: 'type',
  category: 'category',
  actionUrl: 'actionUrl',
  priority: 'priority',
  metadata: 'metadata',
  userId: 'userId',
  organizationId: 'organizationId'
};

exports.Prisma.NotificationReceiptScalarFieldEnum = {
  id: 'id',
  notificationId: 'notificationId',
  userId: 'userId',
  isRead: 'isRead',
  readAt: 'readAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.OrganizationRole = exports.$Enums.OrganizationRole = {
  OWNER: 'OWNER',
  INTERVIEWER: 'INTERVIEWER'
};

exports.UserRole = exports.$Enums.UserRole = {
  ADMIN: 'ADMIN',
  USER: 'USER'
};

exports.SubscriptionStatus = exports.$Enums.SubscriptionStatus = {
  FREE: 'FREE',
  ACTIVE: 'ACTIVE',
  CANCELED: 'CANCELED',
  EXPIRED: 'EXPIRED'
};

exports.PaymentStatus = exports.$Enums.PaymentStatus = {
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED'
};

exports.EmailDirection = exports.$Enums.EmailDirection = {
  SENT: 'SENT',
  RECEIVED: 'RECEIVED'
};

exports.Prisma.ModelName = {
  OrganizationUserRole: 'OrganizationUserRole',
  User: 'User',
  Account: 'Account',
  VerificationToken: 'VerificationToken',
  PasswordResetToken: 'PasswordResetToken',
  TwoFactorToken: 'TwoFactorToken',
  TwoFactorConfirmation: 'TwoFactorConfirmation',
  Organization: 'Organization',
  OrganizationSubscription: 'OrganizationSubscription',
  Payment: 'Payment',
  OrganizationActivityLog: 'OrganizationActivityLog',
  JobPost: 'JobPost',
  JobApplication: 'JobApplication',
  CandidateApplication: 'CandidateApplication',
  CandidateReview: 'CandidateReview',
  CandidateTimeline: 'CandidateTimeline',
  FormResponse: 'FormResponse',
  JobPreview: 'JobPreview',
  JobStage: 'JobStage',
  JobMailingTemplate: 'JobMailingTemplate',
  EmailMessage: 'EmailMessage',
  Notification: 'Notification',
  NotificationReceipt: 'NotificationReceipt'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        const runtime = detectRuntime()
        const edgeRuntimeName = {
          'workerd': 'Cloudflare Workers',
          'deno': 'Deno and Deno Deploy',
          'netlify': 'Netlify Edge Functions',
          'edge-light': 'Vercel Edge Functions or Edge Middleware',
        }[runtime]

        let message = 'PrismaClient is unable to run in '
        if (edgeRuntimeName !== undefined) {
          message += edgeRuntimeName + '. As an alternative, try Accelerate: https://pris.ly/d/accelerate.'
        } else {
          message += 'this browser environment, or has been bundled for the browser (running in `' + runtime + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
