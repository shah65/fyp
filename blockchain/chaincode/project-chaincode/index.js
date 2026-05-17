const { Contract } = require('fabric-contract-api');

class ProjectChain extends Contract {
    async initLedger(ctx) {
        console.log("Project ledger initialized!");
        return 'ok';
    }

    // Teacher registers student (only TeacherMSP)
    async registerStudent(ctx, studentId, name, email, teacherId, semester, department, subject) {
        const msp = ctx.clientIdentity.getMSPID();
        console.log("MSP:", msp);

        if (msp !== "TeacherOrgMSP") throw new Error("Only teachers can register students");
        const exists = await this.studentExists(ctx, studentId);
        if (exists) throw new Error(`Student ${studentId} already registered`);
        const student = {
            docType: 'student',
            studentId,
            name,
            email,
            semester,
            department,
            subject,
            registeredBy: teacherId,
             txId: ctx.stub.getTxID()
        };
        await ctx.stub.putState(studentId, Buffer.from(JSON.stringify(student)));
        ctx.stub.setEvent('StudentRegistered', Buffer.from(JSON.stringify({ studentId, name })));
        return JSON.stringify(student);
    }

    // Student creates project (allowed from StudentMSP but must provide registered studentId)
    async createProject(ctx, projectId, title, technology, supervisorId, supervisorName, memberJSON, status, studentId) {
        const msp = ctx.clientIdentity.getMSPID();
        if ( msp !== 'StudentOrgMSP') {
            throw new Error('Only students can  create project');
        }
            const studentExists = await this.studentExists(ctx, studentId);
            if (!studentExists) throw new Error(`Student ${studentId} not registered on blockchain`);
        
        
        const exists = await this.projectExists(ctx, projectId);
        if (exists) throw new Error(`Project ${projectId} already exists`);
        let members;
        try { members = JSON.parse(memberJSON); } catch (e) { throw new Error("Invalid members JSON"); }
        const project = {
            docType: 'project',
            projectId,
            title,
            technology,
            supervisorId,
            supervisorName,
            members,
            status,
            studentId,
             txId: ctx.stub.getTxID()
        };
        await ctx.stub.putState(projectId, Buffer.from(JSON.stringify(project)));
        ctx.stub.setEvent('ProjectCreated', Buffer.from(JSON.stringify({ projectId, title, studentId })));
        return JSON.stringify(project);
    }

    async queryProject(ctx, projectId) {
        const data = await ctx.stub.getState(projectId);
        if (!data || data.length === 0) throw new Error(`Project ${projectId} does not exist`);
        return data.toString();
    }

    async queryAllProjects(ctx) {
        const iterator = await ctx.stub.getStateByRange('', '');
        const results = [];
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value) results.push(JSON.parse(res.value.value.toString('utf8')));
            if (res.done) { await iterator.close(); break; }
        }
        return JSON.stringify(results);
    }

    async studentExists(ctx, studentId) {
        const data = await ctx.stub.getState(studentId);
        return data && data.length > 0;
    }

    async queryStudent(ctx, studentId) {
        const data = await ctx.stub.getState(studentId);
        if (!data || data.length === 0) throw new Error(`Student ${studentId} not found`);
        return data.toString();
    }

    async projectExists(ctx, projectId) {
        const data = await ctx.stub.getState(projectId);
        return data && data.length > 0;
    }
}

module.exports = ProjectChain;