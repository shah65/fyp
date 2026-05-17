import { Gateway, Wallets } from 'fabric-network';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
 

dotenv.config();
const ccpPath = path.resolve(process.cwd(), process.env.FABRIC_CCP_PATH);
const walletPath = path.resolve(process.cwd(), process.env.FABRIC_WALLET_PATH)

console.log("Wallet Path:", walletPath);
console.log("CCP Path:", ccpPath);

class  FabricService{
  constructor(){
    this.gateway = null;
    this.contract = null;
    this.connected = false;
  }

  async connect(identity = 'teacher-admin'){
    try {
      const ccp = JSON.parse(fs.readFileSync(ccpPath,'utf8'));
    const wallet = await Wallets.newFileSystemWallet(walletPath);
      const identityExists = await wallet.get(identity);

      if (!identityExists) {
        throw new Error(`Identity ${identity} not found!`);
      }

      console.log("IDENTITY => ", identityExists.mspId);

      this.gateway = new Gateway();
      await this.gateway.connect(ccp, {
        wallet,
        identity,
        discovery: {
          enabled:true,
          asLocalhost:true
}
      });
      const network = await this.gateway.getNetwork('awkum-channel');
      this.contract = network.getContract('project-chaincode');
      this.connected = true;
      console.log(`Connected to Fabric as ${identity}`);
    } catch (error) {
      console.error('Fabric connection failed:', error);
      throw error;
    }
  }

  // Teacher registers student on blockchain
  async registerStudentOnChain(studentId, name, email, teacherId, semester, department, subject) {
    if (!this.connected) await this.connect('teacher-admin');
    const transaction = await this.contract.createTransaction('registerStudent');
    console.log("Submitting registerStudent transaction...");
    console.log({
      studentId,
      name,
      email,
      teacherId,
      semester,
      department,
      subject
    });
    // transaction.setEndorsingOrganizations("TeacherOrgMSP");
    const result = await transaction.submit( studentId, name, email, teacherId, semester, department, subject)


 
    return JSON.parse(result.toString());
  }

  // Student (shared identity) creates project on blockchain
  async createProjectOnChain(projectData) {
    if (!this.connected) await this.connect('student-user');
    const { projectId, title, technology, supervisorId, supervisorName, memberJSON, status, studentId } = projectData;
    const membersJSON = JSON.stringify(members);
 
    const tx = this.contract.submitTransaction('createProject',
      projectId, title, technology, supervisorId, supervisorName, membersJSON, status, studentId);
  
    return JSON.parse(tx.toString());
  }

  async queryProject(projectId) {
    if (!this.connected) await this.connect('student-user'); // student can query
    const result = await this.contract.evaluateTransaction('queryProject', projectId);
    return JSON.parse(result.toString());
  }

  // Teacher queries all projects
  async queryAllProjects() {
    if (!this.connected) await this.connect('teacher-admin');
    const result = await this.contract.evaluateTransaction('queryAllProjects');
    return JSON.parse(result.toString());
  }

  async disconnect() {
    if (this.gateway) await this.gateway.disconnect();
    this.connected = false;
  }
}
export default new FabricService();