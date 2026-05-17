import { Wallets } from 'fabric-network';
import FabricCAServices from 'fabric-ca-client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const ccpPath = path.resolve(process.cwd(), process.env.FABRIC_CCP_PATH);
const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
const walletPath = path.resolve(process.cwd(), process.env.FABRIC_WALLET_PATH);

// Teacher CA (from connection profile)
const teacherCaInfo = ccp.certificateAuthorities['ca.teacher.awkum.com'];
const caTeacher = new FabricCAServices(teacherCaInfo.url, { verify: false });

// Student CA (manual)
const studentCaUrl = 'https://localhost:8054';
const caStudent = new FabricCAServices(studentCaUrl, { verify: false });

// Helper: create identity object
function createIdentity(mspId, certificate, privateKey) {
  return {
    credentials: {
      certificate,
      privateKey,
    },
    mspId,
    type: 'X.509',
  };
}

async function setup() {
  const wallet = await Wallets.newFileSystemWallet(walletPath);

  // 1. Enroll teacher-admin (TeacherOrgMSP)
  let teacherAdmin = await wallet.get('teacher-admin');
  if (!teacherAdmin) {
    const enrollment = await caTeacher.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
    teacherAdmin = createIdentity('TeacherOrgMSP', enrollment.certificate, enrollment.key.toBytes());
    await wallet.put('teacher-admin', teacherAdmin);
    console.log('✅ teacher-admin enrolled (TeacherOrgMSP)');
  }

  // 2. Enroll student-user (StudentOrgMSP)
  let studentUser = await wallet.get('student-user');
  if (!studentUser) {
    // Enroll student org admin
    const studentAdminEnroll = await caStudent.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
    const studentAdminId = createIdentity('StudentOrgMSP', studentAdminEnroll.certificate, studentAdminEnroll.key.toBytes());
    await wallet.put('student-admin', studentAdminId);

    // Use the student admin to register a new client (student-user)
    const provider = wallet.getProviderRegistry().getProvider(studentAdminId.type);
    const adminUserObj = await provider.getUserContext(studentAdminId, 'student-admin');
    const secret = await caStudent.register({
      enrollmentID: 'student-user',
      affiliation: 'org2.department1',
      role: 'client',
    }, adminUserObj);

    const studentEnroll = await caStudent.enroll({ enrollmentID: 'student-user', enrollmentSecret: secret });
    studentUser = createIdentity('StudentOrgMSP', studentEnroll.certificate, studentEnroll.key.toBytes());
    await wallet.put('student-user', studentUser);
    console.log('✅ student-user enrolled (StudentOrgMSP)');
  }

  console.log('Wallet setup complete. Identities: teacher-admin, student-user');
}

setup();