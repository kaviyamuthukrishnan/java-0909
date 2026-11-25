import java.sql.*;
public class WalletTransfer {
    public static void transfer(Connection c,int from,int to,double amount)throws SQLException {
        if(amount<=0)throw new IllegalArgumentException("Amount must be positive");
        boolean old=c.getAutoCommit(); c.setAutoCommit(false);
        try(PreparedStatement debit=c.prepareStatement("UPDATE wallet SET balance=balance-? WHERE wallet_id=? AND balance>=?");
            PreparedStatement credit=c.prepareStatement("UPDATE wallet SET balance=balance+? WHERE wallet_id=?")) {
            debit.setDouble(1,amount);debit.setInt(2,from);debit.setDouble(3,amount);
            if(debit.executeUpdate()!=1)throw new SQLException("Debit failed");
            credit.setDouble(1,amount);credit.setInt(2,to);
            if(credit.executeUpdate()!=1)throw new SQLException("Credit failed");
            c.commit();
        } catch(SQLException|RuntimeException e){c.rollback();throw e;}
        finally{c.setAutoCommit(old);}
    }
    public static boolean unsafeLogin(Connection c,String id,String pwd)throws SQLException {
        String sql="SELECT * FROM users WHERE id='"+id+"' AND pwd_hash='"+pwd+"'";
        try(Statement s=c.createStatement();ResultSet r=s.executeQuery(sql)){return r.next();}
    }
    public static boolean safeLogin(Connection c,String id,String pwd)throws SQLException {
        try(PreparedStatement p=c.prepareStatement("SELECT 1 FROM users WHERE id=? AND pwd_hash=?")){
            p.setString(1,id);p.setString(2,pwd);try(ResultSet r=p.executeQuery()){return r.next();}
        }
    }
}
